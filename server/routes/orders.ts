import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../types';
import { ah, parse, notFound } from '../http';
import { requireAuth } from '../middleware/auth';
import type { Limiters } from '../middleware/rateLimit';
import { customerCancelOrder, loadOrderBundles, placeOrder } from '../services/orders';
import { GIFT_WRAP_TYPES, SHIPPING_METHODS } from '../../shared/commerce';
import { orderConfirmationEmail, sendSafe } from '../services/email';
import { formatShortDate } from '../services/mappers';

const address = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.').max(120),
  street: z.string().trim().min(1, 'Street address is required.').max(200),
  apt: z.string().trim().max(100).optional(),
  city: z.string().trim().min(1, 'City is required.').max(100),
  state: z.string().trim().max(100).default(''),
  zipCode: z.string().trim().min(2, 'Postal code is required.').max(20),
  country: z.string().trim().min(2, 'Country is required.').max(100),
  phone: z.string().trim().max(40).default('')
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1).max(120),
    quantity: z.number().int().min(1).max(10),
    shadeId: z.string().max(60).optional(),
    size: z.string().max(80).optional()
  })).min(1, 'Your bag is empty.').max(50),
  sampleIds: z.array(z.string().max(80)).max(2).default([]),
  shippingAddress: address,
  shippingMethod: z.enum(SHIPPING_METHODS as [string, ...string[]]),
  giftOption: z.object({
    isGift: z.boolean(),
    giftWrapType: z.enum(GIFT_WRAP_TYPES as [string, ...string[]]).optional(),
    cardMessage: z.string().trim().max(300).optional()
  }).default({ isGift: false }),
  promoCode: z.string().trim().max(40).optional()
});

export function ordersRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  r.use('/orders', requireAuth);

  r.post('/orders', limiters.write, ah(async (req, res) => {
    const body = parse(createOrderSchema, req.body);
    const rawKey = req.get('Idempotency-Key');
    const idempotencyKey = rawKey && /^[A-Za-z0-9_-]{8,80}$/.test(rawKey) ? rawKey : undefined;
    const provider = deps.config.PAYMENT_PROVIDER;

    const { order, created } = await placeOrder(deps, req.user!, {
      items: body.items,
      sampleIds: body.sampleIds,
      shippingAddress: body.shippingAddress,
      shippingMethod: body.shippingMethod as any,
      gift: body.giftOption as any,
      promoCode: body.promoCode,
      idempotencyKey,
      paymentProvider: provider,
      paymentMethod: provider === 'manual' ? 'Pay on delivery' : 'Card (secure checkout)'
    });

    if (created) {
      sendSafe(deps.mailer, deps.logger, {
        to: req.user!.email,
        ...orderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: req.user!.name,
          items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPriceCents: Math.round(i.unitPrice * 100) })),
          totalCents: Math.round(order.total * 100),
          paymentMethod: order.paymentMethod,
          estimatedDelivery: order.estimatedDelivery || formatShortDate(null)
        }, deps.config.APP_URL)
      });
    }
    res.status(created ? 201 : 200).json({ order });
  }));

  r.get('/orders/:id', ah(async (req, res) => {
    const id = parse(z.string().uuid(), req.params.id);
    const [order] = await loadOrderBundles(deps.db, 'WHERE id = $1 AND user_id = $2', [id, req.user!.id]);
    if (!order) throw notFound('Order not found.');
    res.json({ order });
  }));

  r.post('/orders/:id/cancel', limiters.write, ah(async (req, res) => {
    const id = parse(z.string().uuid(), req.params.id);
    res.json({ order: await customerCancelOrder(deps, id, req.user!) });
  }));

  return r;
}
