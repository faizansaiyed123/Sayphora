import { toDollars } from '../../shared/commerce';
import type { AuthUser } from '../types';

export const PRODUCT_COLUMNS = `id, name, brand, category, subcategory, price_cents, original_price_cents, rating, review_count,
  is_bestseller, is_clean, is_sale, is_new, stock, status, description, details, how_to_use, ingredients, ingredient_analysis,
  image, hover_image, shades, sizes, skin_types, coverage, finish, awards, frequently_bought_with`;

export interface ProductRow {
  id: string; name: string; brand: string; category: string; subcategory: string; price_cents: number;
  original_price_cents: number | null; rating: number; review_count: number; is_bestseller: boolean; is_clean: boolean;
  is_sale: boolean; is_new: boolean; stock: number; status: 'Active' | 'Draft' | 'Archived'; description: string;
  details: string[]; how_to_use: string[]; ingredients: string; ingredient_analysis: unknown; image: string;
  hover_image: string; shades: unknown[]; sizes: string[]; skin_types: string[]; coverage: string | null;
  finish: string | null; awards: string | null; frequently_bought_with: string[];
}

export function toProduct(r: ProductRow) {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    category: r.category,
    subcategory: r.subcategory,
    price: toDollars(r.price_cents),
    originalPrice: r.original_price_cents ? toDollars(r.original_price_cents) : undefined,
    rating: Number(r.rating),
    reviewCount: r.review_count,
    isBestseller: r.is_bestseller,
    isNew: r.is_new,
    isClean: r.is_clean,
    isSale: r.is_sale,
    stockLeft: r.stock,
    status: r.status,
    description: r.description,
    details: r.details,
    howToUse: r.how_to_use,
    ingredients: r.ingredients,
    ingredientAnalysis: r.ingredient_analysis ?? undefined,
    image: r.image,
    hoverImage: r.hover_image,
    shades: r.shades.length ? r.shades : undefined,
    sizes: r.sizes.length ? r.sizes : undefined,
    skinTypes: r.skin_types.length ? r.skin_types : undefined,
    coverage: r.coverage ?? undefined,
    finish: r.finish ?? undefined,
    awards: r.awards ?? undefined,
    frequentlyBoughtWith: r.frequently_bought_with.length ? r.frequently_bought_with : undefined
  };
}

export interface AddressRow {
  id: string; full_name: string; street: string; apt: string | null; city: string; state: string; zip_code: string;
  country: string; phone: string;
}

export const toAddress = (a: AddressRow) => ({
  id: a.id, fullName: a.full_name, street: a.street, apt: a.apt ?? undefined, city: a.city, state: a.state,
  zipCode: a.zip_code, country: a.country, phone: a.phone
});

export function toUser(u: AuthUser, addresses: AddressRow[], pointsToNextTier: number) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    tier: u.tier,
    points: u.points,
    pointsToNextTier,
    phone: u.phone ?? undefined,
    beautyProfile: {
      skinType: u.skinType,
      skinTone: u.skinTone,
      undertone: u.undertone,
      concerns: u.concerns,
      favoriteBrands: u.favoriteBrands
    },
    savedAddresses: addresses.map(toAddress)
  };
}

const longDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const formatLongDate = (d: Date | string) => longDate(typeof d === 'string' ? new Date(d) : d);
export const formatShortDate = (isoDate: string | null) =>
  isoDate ? new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;

export interface OrderRow {
  id: string; order_number: string; user_id: string | null; customer_email: string; status: string; payment_method: string;
  payment_provider: string; payment_status: string; payment_expires_at: Date | null; subtotal_cents: number; discount_cents: number;
  gift_fee_cents: number; shipping_cents: number; tax_cents: number; total_cents: number; currency: string;
  promo_code: string | null; shipping_method: string; carrier: string | null; tracking_number: string | null;
  estimated_delivery: string | null; ship_full_name: string; ship_street: string; ship_apt: string | null; ship_city: string;
  ship_state: string; ship_zip_code: string; ship_country: string; ship_phone: string; is_gift: boolean;
  gift_wrap_type: string | null; gift_message: string | null; samples: unknown[]; points_earned: number; created_at: Date;
}

export interface OrderItemRow {
  id: string; order_id: string; product_id: string; product_name: string; brand: string; category: string; image: string;
  shade_id: string | null; shade_name: string | null; shade_hex: string | null; size: string | null; quantity: number; unit_price_cents: number;
}

export interface OrderEventRow { order_id: string; status: string; note: string | null; created_at: Date }

export function toOrder(o: OrderRow, items: OrderItemRow[], events: OrderEventRow[] = []) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    date: formatLongDate(o.created_at),
    createdAt: o.created_at.toISOString(),
    customerEmail: o.customer_email,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      name: i.product_name,
      brand: i.brand,
      category: i.category,
      image: i.image,
      shadeId: i.shade_id ?? undefined,
      shadeName: i.shade_name ?? undefined,
      shadeHex: i.shade_hex ?? undefined,
      size: i.size ?? undefined,
      quantity: i.quantity,
      unitPrice: toDollars(i.unit_price_cents)
    })),
    samples: o.samples,
    subtotal: toDollars(o.subtotal_cents),
    discount: toDollars(o.discount_cents),
    giftFee: toDollars(o.gift_fee_cents),
    tax: toDollars(o.tax_cents),
    shipping: toDollars(o.shipping_cents),
    total: toDollars(o.total_cents),
    currency: o.currency,
    promoCode: o.promo_code ?? undefined,
    shippingAddress: {
      fullName: o.ship_full_name, street: o.ship_street, apt: o.ship_apt ?? undefined, city: o.ship_city,
      state: o.ship_state, zipCode: o.ship_zip_code, country: o.ship_country, phone: o.ship_phone
    },
    shippingMethod: o.shipping_method,
    paymentMethod: o.payment_method,
    paymentProvider: o.payment_provider,
    paymentStatus: o.payment_status,
    giftOption: { isGift: o.is_gift, giftWrapType: o.gift_wrap_type ?? 'Signature Black & Gold Box', cardMessage: o.gift_message ?? undefined },
    status: o.status,
    carrier: o.carrier ?? undefined,
    trackingNumber: o.tracking_number ?? '',
    estimatedDelivery: formatShortDate(o.estimated_delivery) ?? '',
    pointsEarned: o.points_earned,
    events: events.map((e) => ({ status: e.status, note: e.note ?? undefined, at: e.created_at.toISOString() }))
  };
}
