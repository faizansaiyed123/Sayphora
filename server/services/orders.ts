import type { Db, Tx } from '../db/pool';
import { withTx } from '../db/pool';
import type { AppDeps, AuthUser } from '../types';
import { HttpError, conflict, notFound, badRequest } from '../http';
import {
  DEFAULT_PRICING_RULES, DELIVERY_BUSINESS_DAYS, SAMPLE_MIN_SPEND_CENTS, addBusinessDays, canTransition, computePricing,
  type GiftWrapType, type OrderStatus, type PricingRules, type ShippingMethod
} from '../../shared/commerce';
import { adjustLoyalty } from './loyalty';
import { assertPromoUsable, lockPromo, normalizeCode, toPromoRule } from './promos';
import { toOrder, type OrderItemRow, type OrderRow, type OrderEventRow } from './mappers';

export const pricingRules = (config: AppDeps['config']): PricingRules => ({ ...DEFAULT_PRICING_RULES, taxRate: config.TAX_RATE });

export interface PlaceOrderInput {
  items: Array<{ productId: string; quantity: number; shadeId?: string; size?: string }>;
  sampleIds: string[];
  shippingAddress: { fullName: string; street: string; apt?: string; city: string; state: string; zipCode: string; country: string; phone: string };
  shippingMethod: ShippingMethod;
  gift: { isGift: boolean; giftWrapType?: GiftWrapType; cardMessage?: string };
  promoCode?: string;
  idempotencyKey?: string;
  paymentMethod: string;
  paymentProvider: string;
}

interface LockedProduct {
  id: string; name: string; brand: string; category: string; price_cents: number; stock: number; status: string;
  image: string; shades: Array<{ id: string; name: string; hex: string; inStock?: boolean }>; sizes: string[];
}

const ORDER_COLUMNS = `id, order_number, user_id, customer_email, status, payment_method, payment_provider, payment_status,
  payment_expires_at, subtotal_cents, discount_cents, gift_fee_cents, shipping_cents, tax_cents, total_cents, currency, promo_code,
  shipping_method, carrier, tracking_number, estimated_delivery, ship_full_name, ship_street, ship_apt, ship_city, ship_state,
  ship_zip_code, ship_country, ship_phone, is_gift, gift_wrap_type, gift_message, samples, points_earned, created_at`;

export async function loadOrderBundles(db: Db | Tx, whereSql: string, params: unknown[], opts: { limit?: number; offset?: number; withEvents?: boolean } = {}) {
  const limit = Math.min(opts.limit ?? 100, 500);
  const { rows: orders } = await db.query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${opts.offset ?? 0}`,
    params
  );
  if (orders.length === 0) return [];
  const ids = orders.map((o) => o.id);
  const { rows: items } = await db.query<OrderItemRow>('SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY product_name', [ids]);
  const { rows: events } = opts.withEvents === false
    ? { rows: [] as OrderEventRow[] }
    : await db.query<OrderEventRow>('SELECT order_id, status, note, created_at FROM order_events WHERE order_id = ANY($1) ORDER BY created_at, id', [ids]);
  return orders.map((o) =>
    toOrder(o, items.filter((i) => i.order_id === o.id), events.filter((e) => e.order_id === o.id))
  );
}

export async function placeOrder(deps: AppDeps, user: AuthUser, input: PlaceOrderInput) {
  const { db, config } = deps;

  return withTx(db, async (tx) => {
    // Idempotency: a retried submit returns the original order instead of charging twice.
    if (input.idempotencyKey) {
      const { rows } = await tx.query<{ id: string }>('SELECT id FROM orders WHERE user_id = $1 AND idempotency_key = $2', [user.id, input.idempotencyKey]);
      if (rows[0]) {
        const [existing] = await loadOrderBundles(tx, 'WHERE id = $1', [rows[0].id]);
        return { order: existing, created: false };
      }
    }

    // Merge duplicate lines per product for stock checking.
    const qtyByProduct = new Map<string, number>();
    for (const it of input.items) qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) ?? 0) + it.quantity);
    const productIds = [...qtyByProduct.keys()].sort(); // consistent lock order prevents deadlocks

    const { rows: products } = await tx.query<LockedProduct>(
      `SELECT id, name, brand, category, price_cents, stock, status, image, shades, sizes
       FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE`,
      [productIds]
    );
    const byId = new Map(products.map((p) => [p.id, p]));

    const stockIssues: Array<{ productId: string; name?: string; requested: number; available: number }> = [];
    for (const [pid, qty] of qtyByProduct) {
      const p = byId.get(pid);
      if (!p || p.status !== 'Active') throw conflict(`"${p?.name ?? pid}" is no longer available.`, { productId: pid });
      if (p.stock < qty) stockIssues.push({ productId: pid, name: p.name, requested: qty, available: p.stock });
    }
    if (stockIssues.length) {
      const s = stockIssues[0];
      throw new HttpError(409, s.available === 0 ? `"${s.name}" is sold out.` : `Only ${s.available} of "${s.name}" left in stock.`, 'insufficient_stock', stockIssues);
    }

    const lines = input.items.map((it) => {
      const p = byId.get(it.productId)!;
      let shade: { id: string; name: string; hex: string; inStock?: boolean } | undefined;
      if (p.shades.length) {
        shade = p.shades.find((s) => s.id === it.shadeId) ?? undefined;
        if (!shade) throw badRequest(`Please choose a valid shade for "${p.name}".`);
        if (shade.inStock === false) throw conflict(`Shade "${shade.name}" of "${p.name}" is out of stock.`, { productId: p.id });
      }
      if (p.sizes.length && it.size && !p.sizes.includes(it.size)) throw badRequest(`Invalid size for "${p.name}".`);
      return { product: p, shade, size: it.size ?? p.sizes[0] ?? null, quantity: it.quantity, unitPriceCents: p.price_cents };
    });

    // Samples
    let samples: unknown[] = [];
    if (input.sampleIds.length) {
      const merch = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
      if (merch < SAMPLE_MIN_SPEND_CENTS) throw new HttpError(422, 'Complimentary samples are available on orders over $50.', 'samples_min_spend');
      const { rows } = await tx.query('SELECT id, name, brand, category, image FROM samples WHERE id = ANY($1) AND is_active', [input.sampleIds]);
      if (rows.length !== new Set(input.sampleIds).size) throw badRequest('One of the selected samples is unavailable.');
      samples = rows;
    }

    // Fresh tier (row lock also serialises this user's concurrent checkouts)
    const { rows: [freshUser] } = await tx.query<{ tier: AuthUser['tier'] }>('SELECT tier FROM users WHERE id = $1 FOR UPDATE', [user.id]);
    const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);

    // Promo
    let promoRow;
    if (input.promoCode) {
      promoRow = assertPromoUsable(await lockPromo(tx, normalizeCode(input.promoCode)), { userId: user.id, tier: freshUser.tier, subtotalCents });
    }

    const pricing = computePricing({
      lines,
      promo: promoRow ? toPromoRule(promoRow) : null,
      shippingMethod: input.shippingMethod,
      isGift: input.gift.isGift,
      giftWrapType: input.gift.giftWrapType,
      tier: freshUser.tier,
      rules: pricingRules(config)
    });

    // Stock decrement (guarded again in SQL so the CHECK constraint can never be tripped)
    for (const [pid, qty] of qtyByProduct) {
      const r = await tx.query('UPDATE products SET stock = stock - $2 WHERE id = $1 AND stock >= $2', [pid, qty]);
      if (r.rowCount !== 1) throw conflict('Stock changed while you were checking out. Please review your bag.');
    }
    if (promoRow) await tx.query('UPDATE promo_codes SET usage_count = usage_count + 1 WHERE code = $1', [promoRow.code]);

    const now = new Date();
    const eta = addBusinessDays(now, DELIVERY_BUSINESS_DAYS[input.shippingMethod]).toISOString().slice(0, 10);
    const a = input.shippingAddress;
    const holdPayment = input.paymentProvider !== 'manual';

    const { rows: [{ order_number }] } = await tx.query<{ order_number: string }>("SELECT 'SAY-' || nextval('order_number_seq') AS order_number");
    const { rows: [created] } = await tx.query<{ id: string }>(
      `INSERT INTO orders (order_number, user_id, customer_email, payment_method, payment_provider, payment_status, payment_expires_at,
         subtotal_cents, discount_cents, gift_fee_cents, shipping_cents, tax_cents, total_cents, promo_code, shipping_method,
         estimated_delivery, ship_full_name, ship_street, ship_apt, ship_city, ship_state, ship_zip_code, ship_country, ship_phone,
         is_gift, gift_wrap_type, gift_message, samples, points_earned, idempotency_key)
       VALUES ($1,$2,$3,$4,$5,'Pending',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27::jsonb,$28,$29)
       RETURNING id`,
      [
        order_number, user.id, user.email, input.paymentMethod, input.paymentProvider,
        holdPayment ? new Date(now.getTime() + config.PAYMENT_HOLD_MINUTES * 60_000) : null,
        pricing.subtotalCents, pricing.discountCents, pricing.giftFeeCents, pricing.shippingCents, pricing.taxCents, pricing.totalCents,
        promoRow?.code ?? null, input.shippingMethod, eta,
        a.fullName, a.street, a.apt || null, a.city, a.state, a.zipCode, a.country, a.phone,
        input.gift.isGift, input.gift.isGift ? input.gift.giftWrapType ?? null : null, input.gift.isGift ? input.gift.cardMessage || null : null,
        JSON.stringify(samples), pricing.pointsEarned, input.idempotencyKey ?? null
      ]
    );

    for (const l of lines) {
      await tx.query(
        `INSERT INTO order_items (order_id, product_id, product_name, brand, category, image, shade_id, shade_name, shade_hex, size, quantity, unit_price_cents)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [created.id, l.product.id, l.product.name, l.product.brand, l.product.category, l.product.image,
         l.shade?.id ?? null, l.shade?.name ?? null, l.shade?.hex ?? null, l.size, l.quantity, l.unitPriceCents]
      );
    }
    await tx.query('INSERT INTO order_events (order_id, status, note, actor_user_id) VALUES ($1,$2,$3,$4)', [
      created.id, 'Processing', holdPayment ? 'Order placed; awaiting payment' : 'Order placed', user.id
    ]);

    // Offline ("manual") payments are committed at placement: award loyalty now.
    if (!holdPayment) await awardLoyalty(tx, created.id);

    const [order] = await loadOrderBundles(tx, 'WHERE id = $1', [created.id]);
    return { order, created: true };
  });
}

/** Credits points + lifetime spend exactly once per order. */
export async function awardLoyalty(tx: Tx, orderId: string): Promise<void> {
  const { rows } = await tx.query<{ user_id: string | null; points_earned: number; subtotal_cents: number; discount_cents: number }>(
    'UPDATE orders SET points_awarded = true WHERE id = $1 AND points_awarded = false RETURNING user_id, points_earned, subtotal_cents, discount_cents',
    [orderId]
  );
  const o = rows[0];
  if (o?.user_id) await adjustLoyalty(tx, o.user_id, o.points_earned, o.subtotal_cents - o.discount_cents);
}

/** Cancels an order inside `tx`: restocks, reverses loyalty and promo usage. */
export async function cancelOrderTx(tx: Tx, orderId: string, actorId: string | null, note: string) {
  const { rows } = await tx.query<OrderRow & { points_awarded: boolean }>('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
  const o = rows[0];
  if (!o) throw notFound('Order not found.');
  if (o.status === 'Cancelled') return { refundRequired: false };

  const { rows: items } = await tx.query<{ product_id: string; quantity: number }>('SELECT product_id, quantity FROM order_items WHERE order_id = $1 ORDER BY product_id', [orderId]);
  for (const i of items) await tx.query('UPDATE products SET stock = stock + $2 WHERE id = $1', [i.product_id, i.quantity]);

  if (o.points_awarded && o.user_id) {
    await adjustLoyalty(tx, o.user_id, -o.points_earned, -(o.subtotal_cents - o.discount_cents));
    await tx.query('UPDATE orders SET points_awarded = false WHERE id = $1', [orderId]);
  }
  if (o.promo_code) await tx.query('UPDATE promo_codes SET usage_count = GREATEST(0, usage_count - 1) WHERE code = $1', [o.promo_code]);

  await tx.query(`UPDATE orders SET status = 'Cancelled', cancelled_at = now(), payment_expires_at = NULL,
    payment_status = CASE WHEN payment_status = 'Pending' THEN 'Failed' ELSE payment_status END WHERE id = $1`, [orderId]);
  await tx.query('INSERT INTO order_events (order_id, status, note, actor_user_id) VALUES ($1,$2,$3,$4)', [orderId, 'Cancelled', note, actorId]);
  return { refundRequired: o.payment_status === 'Paid' };
}

export interface AdminOrderUpdate { status?: OrderStatus; trackingNumber?: string; carrier?: string; paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded' }

export async function adminUpdateOrder(deps: AppDeps, orderId: string, actor: AuthUser, update: AdminOrderUpdate) {
  return withTx(deps.db, async (tx) => {
    const { rows } = await tx.query<OrderRow>('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
    const o = rows[0];
    if (!o) throw notFound('Order not found.');

    let refundRequired = false;
    if (update.status && update.status !== o.status) {
      if (!canTransition(o.status as OrderStatus, update.status)) {
        throw new HttpError(409, `An order cannot move from "${o.status}" to "${update.status}".`, 'invalid_transition');
      }
      if (update.status === 'Cancelled') {
        ({ refundRequired } = await cancelOrderTx(tx, orderId, actor.id, 'Cancelled by staff'));
      } else {
        await tx.query('UPDATE orders SET status = $2 WHERE id = $1', [orderId, update.status]);
        await tx.query('INSERT INTO order_events (order_id, status, actor_user_id) VALUES ($1,$2,$3)', [orderId, update.status, actor.id]);
        // Offline payment is settled on delivery.
        if (update.status === 'Delivered' && o.payment_provider === 'manual' && o.payment_status === 'Pending') {
          await tx.query("UPDATE orders SET payment_status = 'Paid' WHERE id = $1", [orderId]);
        }
      }
    } else if (update.status === o.status) {
      throw new HttpError(409, `Order is already "${o.status}".`, 'invalid_transition');
    }
    if (update.trackingNumber !== undefined || update.carrier !== undefined) {
      await tx.query('UPDATE orders SET tracking_number = COALESCE($2, tracking_number), carrier = COALESCE($3, carrier) WHERE id = $1', [
        orderId, update.trackingNumber ?? null, update.carrier ?? null
      ]);
    }
    if (update.paymentStatus && update.paymentStatus !== o.payment_status) {
      await tx.query('UPDATE orders SET payment_status = $2 WHERE id = $1', [orderId, update.paymentStatus]);
      await tx.query('INSERT INTO order_events (order_id, status, note, actor_user_id) VALUES ($1,$2,$3,$4)', [
        orderId, update.status ?? o.status, `Payment marked ${update.paymentStatus}`, actor.id
      ]);
      if (update.paymentStatus === 'Paid') await awardLoyalty(tx, orderId);
    }
    const [order] = await loadOrderBundles(tx, 'WHERE id = $1', [orderId]);
    return { order, refundRequired, previousStatus: o.status };
  });
}

/** Customer-initiated cancellation: only unpaid/offline orders that have not been packed or shipped. */
export async function customerCancelOrder(deps: AppDeps, orderId: string, user: AuthUser) {
  return withTx(deps.db, async (tx) => {
    const { rows } = await tx.query<OrderRow>('SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE', [orderId, user.id]);
    const o = rows[0];
    if (!o) throw notFound('Order not found.');
    if (o.status !== 'Processing') throw new HttpError(409, 'This order has already been prepared for shipment and can no longer be cancelled online. Please contact support.', 'not_cancellable');
    if (o.payment_status === 'Paid') throw new HttpError(409, 'Paid orders must be cancelled by our support team so your refund can be issued. Please contact support.', 'not_cancellable');
    await cancelOrderTx(tx, orderId, user.id, 'Cancelled by customer');
    const [order] = await loadOrderBundles(tx, 'WHERE id = $1', [orderId]);
    return order;
  });
}
