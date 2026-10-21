/**
 * Commerce rules shared by the API (authoritative) and the storefront (display).
 * All money is handled as integer cents to avoid floating point drift.
 */

export type ShippingMethod = 'Standard' | 'Express' | 'Next-Day';
export type GiftWrapType = 'Signature Black & Gold Box' | 'Eco Velvet Pouch';
export type Tier = 'Insider' | 'VIB' | 'Rouge';

export const SHIPPING_METHODS: ShippingMethod[] = ['Standard', 'Express', 'Next-Day'];
export const GIFT_WRAP_TYPES: GiftWrapType[] = ['Signature Black & Gold Box', 'Eco Velvet Pouch'];
export const TIERS: Tier[] = ['Insider', 'VIB', 'Rouge'];

export interface PricingRules {
  taxRate: number;
  freeShippingThresholdCents: number;
  shippingCents: Record<ShippingMethod, number>;
  giftFeeCents: Record<GiftWrapType, number>;
}

export const DEFAULT_PRICING_RULES: PricingRules = {
  taxRate: 0.08875,
  freeShippingThresholdCents: 5000,
  shippingCents: { Standard: 595, Express: 1200, 'Next-Day': 2500 },
  giftFeeCents: { 'Signature Black & Gold Box': 500, 'Eco Velvet Pouch': 300 }
};

/** Lifetime spend (in cents) required to reach each tier. */
export const TIER_THRESHOLD_CENTS: Record<Tier, number> = {
  Insider: 0,
  VIB: 35_000,
  Rouge: 100_000
};

export const WELCOME_POINTS = 50;
/** Minimum merchandise subtotal for complimentary samples. */
export const SAMPLE_MIN_SPEND_CENTS = 5000;
/** Business days from dispatch to delivery, per shipping method. */
export const DELIVERY_BUSINESS_DAYS: Record<ShippingMethod, number> = { Standard: 5, Express: 2, 'Next-Day': 1 };

export interface PromoRule {
  code: string;
  discountPercent?: number | null;
  discountAmountCents?: number | null;
  freeShipping?: boolean;
  minSpendCents?: number;
}

export interface PricingInput {
  lines: Array<{ unitPriceCents: number; quantity: number }>;
  promo?: PromoRule | null;
  shippingMethod: ShippingMethod;
  isGift?: boolean;
  giftWrapType?: GiftWrapType;
  tier?: Tier | null;
  rules?: PricingRules;
}

export interface PricingResult {
  subtotalCents: number;
  discountCents: number;
  giftFeeCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  freeShipping: boolean;
  pointsEarned: number;
}

export const toCents = (dollars: number): number => Math.round(dollars * 100);
export const toDollars = (cents: number): number => Math.round(cents) / 100;

export function computePricing(input: PricingInput): PricingResult {
  const rules = input.rules ?? DEFAULT_PRICING_RULES;
  const subtotalCents = input.lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);

  let discountCents = 0;
  const promo = input.promo;
  if (promo && subtotalCents >= (promo.minSpendCents ?? 0)) {
    if (promo.discountPercent) discountCents = Math.round((subtotalCents * promo.discountPercent) / 100);
    else if (promo.discountAmountCents) discountCents = Math.min(subtotalCents, promo.discountAmountCents);
  }
  discountCents = Math.min(discountCents, subtotalCents);

  const giftFeeCents = input.isGift && input.giftWrapType ? (rules.giftFeeCents[input.giftWrapType] ?? 0) : 0;

  const freeShipping = Boolean(promo?.freeShipping) || input.tier === 'Rouge';
  let shippingCents = 0;
  if (!freeShipping) {
    if (input.shippingMethod === 'Standard') {
      shippingCents = subtotalCents >= rules.freeShippingThresholdCents ? 0 : rules.shippingCents.Standard;
    } else {
      shippingCents = rules.shippingCents[input.shippingMethod];
    }
  }

  const taxableCents = Math.max(0, subtotalCents - discountCents + giftFeeCents);
  const taxCents = Math.round(taxableCents * rules.taxRate);
  const totalCents = taxableCents + taxCents + shippingCents;
  const pointsEarned = Math.floor(Math.max(0, subtotalCents - discountCents) / 100);

  return { subtotalCents, discountCents, giftFeeCents, shippingCents, taxCents, totalCents, freeShipping, pointsEarned };
}

export function tierForSpend(lifetimeSpendCents: number): Tier {
  if (lifetimeSpendCents >= TIER_THRESHOLD_CENTS.Rouge) return 'Rouge';
  if (lifetimeSpendCents >= TIER_THRESHOLD_CENTS.VIB) return 'VIB';
  return 'Insider';
}

/** Dollars of additional spend needed to reach the next tier (0 when already at the top). */
export function dollarsToNextTier(lifetimeSpendCents: number): number {
  const tier = tierForSpend(lifetimeSpendCents);
  if (tier === 'Rouge') return 0;
  const next = tier === 'Insider' ? TIER_THRESHOLD_CENTS.VIB : TIER_THRESHOLD_CENTS.Rouge;
  return Math.ceil((next - lifetimeSpendCents) / 100);
}

/** Adds business days (Mon–Fri) to a date, returning a new Date. */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return d;
}

export type OrderStatus =
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Processing',
  'Packed',
  'Shipped',
  'In Transit',
  'Out for Delivery',
  'Delivered'
];

/** Whether an admin may move an order from `from` to `to`. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  if (from === 'Delivered' || from === 'Cancelled') return false;
  if (to === 'Cancelled') return ['Processing', 'Packed'].includes(from);
  const a = ORDER_STATUS_FLOW.indexOf(from);
  const b = ORDER_STATUS_FLOW.indexOf(to);
  return a !== -1 && b > a;
}
