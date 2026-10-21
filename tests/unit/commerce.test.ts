import { describe, it, expect } from 'vitest';
import {
  addBusinessDays, canTransition, computePricing, dollarsToNextTier, tierForSpend, toCents, toDollars, DEFAULT_PRICING_RULES
} from '../../shared/commerce';

const line = (price: number, qty = 1) => ({ unitPriceCents: toCents(price), quantity: qty });

describe('computePricing', () => {
  it('computes subtotal, tax and total for a plain order under the free-shipping threshold', () => {
    const p = computePricing({ lines: [line(40)], shippingMethod: 'Standard' });
    expect(p.subtotalCents).toBe(4000);
    expect(p.shippingCents).toBe(595);
    expect(p.taxCents).toBe(355); // 8.875% of 40.00
    expect(p.totalCents).toBe(4950);
    expect(p.pointsEarned).toBe(40);
  });

  it('gives free standard shipping at the threshold but still charges for express', () => {
    expect(computePricing({ lines: [line(50)], shippingMethod: 'Standard' }).shippingCents).toBe(0);
    expect(computePricing({ lines: [line(49.99)], shippingMethod: 'Standard' }).shippingCents).toBe(595);
    expect(computePricing({ lines: [line(80)], shippingMethod: 'Express' }).shippingCents).toBe(1200);
    expect(computePricing({ lines: [line(80)], shippingMethod: 'Next-Day' }).shippingCents).toBe(2500);
  });

  it('applies percentage promos to the subtotal and taxes the discounted amount', () => {
    const p = computePricing({ lines: [line(120)], shippingMethod: 'Standard', promo: { code: 'X', discountPercent: 20 } });
    expect(p.discountCents).toBe(2400);
    expect(p.taxCents).toBe(852); // 8.875% of 96.00
    expect(p.totalCents).toBe(9600 + 852);
    expect(p.pointsEarned).toBe(96);
  });

  it('caps fixed discounts at the subtotal and honours min spend', () => {
    expect(computePricing({ lines: [line(5)], shippingMethod: 'Standard', promo: { code: 'X', discountAmountCents: 1000 } }).discountCents).toBe(500);
    expect(computePricing({ lines: [line(30)], shippingMethod: 'Standard', promo: { code: 'X', discountAmountCents: 1000, minSpendCents: 5000 } }).discountCents).toBe(0);
  });

  it('waives shipping for free-shipping promos and Rouge members on every method', () => {
    expect(computePricing({ lines: [line(10)], shippingMethod: 'Next-Day', promo: { code: 'S', freeShipping: true } }).shippingCents).toBe(0);
    expect(computePricing({ lines: [line(10)], shippingMethod: 'Express', tier: 'Rouge' }).shippingCents).toBe(0);
    expect(computePricing({ lines: [line(10)], shippingMethod: 'Express', tier: 'VIB' }).shippingCents).toBe(1200);
  });

  it('adds gift packaging fees before tax', () => {
    const p = computePricing({ lines: [line(100)], shippingMethod: 'Standard', isGift: true, giftWrapType: 'Signature Black & Gold Box' });
    expect(p.giftFeeCents).toBe(500);
    expect(p.taxCents).toBe(Math.round(10500 * 0.08875));
  });

  it('sums quantities and never produces fractional cents', () => {
    const p = computePricing({ lines: [line(19.99, 3), line(7.33, 2)], shippingMethod: 'Standard', promo: { code: 'X', discountPercent: 15 } });
    for (const v of [p.subtotalCents, p.discountCents, p.taxCents, p.totalCents]) expect(Number.isInteger(v)).toBe(true);
    expect(p.subtotalCents).toBe(1999 * 3 + 733 * 2);
  });

  it('uses configurable rules (tax rate)', () => {
    const p = computePricing({ lines: [line(100)], shippingMethod: 'Standard', rules: { ...DEFAULT_PRICING_RULES, taxRate: 0 } });
    expect(p.taxCents).toBe(0);
  });
});

describe('loyalty tiers', () => {
  it('derives tiers from lifetime spend', () => {
    expect(tierForSpend(0)).toBe('Insider');
    expect(tierForSpend(34_999)).toBe('Insider');
    expect(tierForSpend(35_000)).toBe('VIB');
    expect(tierForSpend(99_999)).toBe('VIB');
    expect(tierForSpend(100_000)).toBe('Rouge');
  });
  it('reports dollars needed to reach the next tier', () => {
    expect(dollarsToNextTier(0)).toBe(350);
    expect(dollarsToNextTier(34_950)).toBe(1);
    expect(dollarsToNextTier(50_000)).toBe(500);
    expect(dollarsToNextTier(200_000)).toBe(0);
  });
});

describe('order status transitions', () => {
  it('only allows forward movement', () => {
    expect(canTransition('Processing', 'Packed')).toBe(true);
    expect(canTransition('Processing', 'Delivered')).toBe(true);
    expect(canTransition('Shipped', 'Packed')).toBe(false);
    expect(canTransition('Packed', 'Packed')).toBe(false);
  });
  it('allows cancellation only before shipment and never from terminal states', () => {
    expect(canTransition('Processing', 'Cancelled')).toBe(true);
    expect(canTransition('Packed', 'Cancelled')).toBe(true);
    expect(canTransition('Shipped', 'Cancelled')).toBe(false);
    expect(canTransition('Delivered', 'Cancelled')).toBe(false);
    expect(canTransition('Cancelled', 'Processing')).toBe(false);
  });
});

describe('helpers', () => {
  it('skips weekends when adding business days', () => {
    const friday = new Date('2026-10-16T12:00:00Z');
    expect(addBusinessDays(friday, 1).toISOString().slice(0, 10)).toBe('2026-10-19');
    expect(addBusinessDays(friday, 5).toISOString().slice(0, 10)).toBe('2026-10-23');
  });
  it('converts between dollars and cents without drift', () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toDollars(1999)).toBe(19.99);
  });
});
