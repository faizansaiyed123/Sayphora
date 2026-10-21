import { describe, it, expect } from 'vitest';
import { pickShade, pickStylistProduct, scoreProduct } from '../../server/services/aiFeatures';
import { parseJsonLoose } from '../../server/services/ai';

const shades = [
  { id: '100', name: '100 - Very Fair with Neutral undertones', hex: '#fae3d2' },
  { id: '120', name: '120 - Fair with Warm Neutral undertones', hex: '#f7dcc6' },
  { id: '185', name: '185 - Light Medium with Neutral undertones', hex: '#eec7a9' },
  { id: '230', name: '230 - Medium with Warm undertones', hex: '#e5b694' },
  { id: '310', name: '310 - Tan with Warm Golden undertones', hex: '#cf986c' },
  { id: '390', name: '390 - Tan Deep with Warm Olive undertones', hex: '#b37748' },
  { id: '420', name: '420 - Deep with Warm undertones', hex: '#8a522f' },
  { id: '480', name: '480 - Very Deep with Neutral undertones', hex: '#5c351f' }
];

describe('pickShade', () => {
  it('maps depth extremes to the lightest and deepest shades', () => {
    expect(pickShade(shades, 'Fair', 'Neutral')!.shade.id).toBe('100');
    expect(pickShade(shades, 'Rich', 'Neutral')!.shade.id).toBe('480');
  });
  it('prefers the undertone match among neighbouring shades', () => {
    const warm = pickShade(shades, 'Medium', 'Warm')!;
    expect(warm.shade.name).toContain('Warm');
    expect(pickShade(shades, 'Medium', 'Neutral')!.shade.name).toContain('Neutral');
  });
  it('never returns an out-of-stock shade', () => {
    const limited = shades.map((s) => (s.id === '230' ? { ...s, inStock: false } : s));
    expect(pickShade(limited, 'Medium', 'Warm')!.shade.id).not.toBe('230');
    expect(pickShade(shades.map((s) => ({ ...s, inStock: false })), 'Medium', 'Warm')).toBeNull();
  });
});

const product = (o: Record<string, unknown>) => ({ id: 'p', name: 'n', brand: 'b', category: 'Skincare', subcategory: 's', description: '', details: [], ingredients: '', isBestseller: false, ...o }) as any;

describe('scoreProduct', () => {
  it('rewards skin-type fit and concern keyword matches', () => {
    const serum = product({ description: 'Hydrating hyaluronic serum that refines pores', skinTypes: ['Dry'] });
    const hit = scoreProduct(serum, 'Dry', ['Hydration', 'Pore Smoothing']);
    expect(hit.score).toBe(2 + 3 + 3);
    expect(hit.matched).toEqual(['Hydration', 'Pore Smoothing']);
    expect(scoreProduct(serum, 'Oily', ['Anti-aging']).score).toBe(0);
  });
});

describe('pickStylistProduct', () => {
  const catalog = [
    product({ id: 'a', category: 'Makeup', subcategory: 'Cheek', name: 'Liquid Blush' }),
    product({ id: 'b', category: 'Fragrance', subcategory: 'Warm' }),
    product({ id: 'c', category: 'Haircare', subcategory: 'Hair Oils' }),
    product({ id: 'd', category: 'Makeup', subcategory: 'Lip Treatments', isBestseller: true })
  ];
  it('routes by topic', () => {
    expect(pickStylistProduct('what blush suits me?', catalog)!.id).toBe('a');
    expect(pickStylistProduct('a new perfume please', catalog)!.id).toBe('b');
    expect(pickStylistProduct('help with frizz', catalog)!.id).toBe('c');
  });
  it('falls back to a bestseller', () => { expect(pickStylistProduct('hello there', catalog)!.id).toBe('d'); });
});

describe('parseJsonLoose', () => {
  it('parses fenced JSON', () => { expect(parseJsonLoose('```json\n{"a":1}\n```')).toEqual({ a: 1 }); });
  it('throws on garbage', () => { expect(() => parseJsonLoose('nope')).toThrow(); });
});
