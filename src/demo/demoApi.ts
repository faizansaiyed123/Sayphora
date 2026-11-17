import { MOCK_PRODUCTS, COMPLIMENTARY_SAMPLES, MOCK_REVIEWS } from '../../server/seed/catalog';
import type {
  Address,
  BoutiquePlace,
  FreeSample,
  Order,
  OrderStatus,
  Product,
  PromoCode,
  Review,
  Reward,
  RewardRedemption,
  SalesAnalytics,
  User,
} from '../types';

export const DEMO_CREDENTIALS = {
  email: 'demo@sayphora.demo',
  password: 'SayphoraDemo2026!',
  name: 'Sofia Laurent',
} as const;

const STATE_KEY = 'sayphora_demo_state_v1';
const SESSION_KEY = 'sayphora_demo_user_id';

type DemoUser = User & {
  password: string;
  wishlist: string[];
};

interface DemoState {
  users: DemoUser[];
  products: Product[];
  reviews: Record<string, Review[]>;
  orders: Order[];
  promos: PromoCode[];
  redemptions: Record<string, RewardRedemption[]>;
  nextUserId: number;
  nextOrderNumber: number;
}

export class DemoApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = 'demo_error',
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'DemoApiError';
  }
}

const now = () => new Date().toISOString();
const uid = (prefix: string) => \`\${prefix}-\${Math.random().toString(36).slice(2, 9)}-\${Date.now().toString(36).slice(-5)}\`;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function fail(message: string, status = 400, code = 'demo_error', fields?: Record<string, string>): never {
  throw new DemoApiError(message, status, code, fields);
}

function seedProducts(): Product[] {
  return clone(MOCK_PRODUCTS).map((product) => ({
    ...product,
    status: 'Active',
    stockLeft: Math.max(product.stockLeft ?? 6, 2),
  }));
}

function seedUsers(): DemoUser[] {
  const commonProfile: User['beautyProfile'] = {
    skinType: 'Combination',
    skinTone: 'Medium',
    undertone: 'Neutral',
    concerns: ['Hydration', 'Uneven texture'],
    favoriteBrands: ['Rare Beauty', 'Fenty Beauty', 'Tatcha'],
  };

  return [
    {
      id: 'demo-admin',
      name: DEMO_CREDENTIALS.name,
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      role: 'Admin',
      tier: 'Rouge',
      points: 8420,
      pointsToNextTier: 0,
      beautyProfile: commonProfile,
      phone: '+1 212 555 0188',
      savedAddresses: [
        {
          id: 'addr-demo',
          fullName: DEMO_CREDENTIALS.name,
          street: '18 Mercer Street',
          apt: 'Suite 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10013',
          country: 'United States',
          phone: '+1 212 555 0188',
        },
      ],
      wishlist: ['rare-beauty-soft-pinch-blush', 'tatcha-water-cream'],
    },
    {
      id: 'demo-customer',
      name: 'Amelia Harper',
      email: 'customer@sayphora.demo',
      password: 'SayphoraCustomer2026!',
      role: 'Customer',
      tier: 'VIB',
      points: 2475,
      pointsToNextTier: 2525,
      beautyProfile: {
        skinType: 'Dry',
        skinTone: 'Light',
        undertone: 'Warm',
        concerns: ['Dryness', 'Glow'],
        favoriteBrands: ['Charlotte Tilbury', 'Glow Recipe'],
      },
      savedAddresses: [],
      wishlist: ['charlotte-tilbury-flawless-filter'],
    },
  ];
}

function seedOrders(): Order[] {
  const product = seedProducts().find((p) => p.id === 'fenty-pro-filtr-foundation')!;
  const address: Address = {
    fullName: 'Sofia Laurent',
    street: '18 Mercer Street',
    apt: 'Suite 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10013',
    country: 'United States',
    phone: '+1 212 555 0188',
  };
  return [
    {
      id: 'demo-order-1',
      orderNumber: 'SPH-10482',
      date: 'Nov 12, 2026',
      createdAt: '2026-11-12T15:30:00.000Z',
      customerEmail: DEMO_CREDENTIALS.email,
      items: [
        {
          id: 'demo-item-1',
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          image: product.image,
          shadeId: product.shades?.[3]?.id,
          shadeName: product.shades?.[3]?.name,
          shadeHex: product.shades?.[3]?.hex,
          size: product.sizes?.[0],
          quantity: 1,
          unitPrice: product.price,
        },
      ],
      samples: clone(COMPLIMENTARY_SAMPLES.slice(0, 1)),
      subtotal: product.price,
      discount: 8,
      giftFee: 0,
      tax: 2.85,
      shipping: 0,
      total: 34.85,
      currency: 'USD',
      promoCode: 'ROUGE20',
      shippingAddress: address,
      shippingMethod: 'Standard',
      paymentMethod: 'Manual / Pay on Delivery',
      paymentStatus: 'Paid',
      status: 'In Transit',
      carrier: 'DHL Express',
      trackingNumber: 'DHL-SPH-10482',
      estimatedDelivery: 'Nov 18, 2026',
      pointsEarned: 135,
      events: [
        { status: 'Processing', note: 'Order confirmed by Sayphora.', at: '2026-11-12T15:30:00.000Z' },
        { status: 'Packed', note: 'Beauty specialist packed your order.', at: '2026-11-13T10:00:00.000Z' },
        { status: 'Shipped', note: 'Package handed to DHL Express.', at: '2026-11-14T08:30:00.000Z' },
        { status: 'In Transit', note: 'Shipment is moving through the network.', at: '2026-11-16T16:10:00.000Z' },
      ],
    },
  ];
}

function seedPromos(): PromoCode[] {
  return [
    {
      code: 'ROUGE20',
      description: 'Rouge members receive 20% off qualifying beauty essentials.',
      discountPercent: 20,
      minSpend: 75,
      usageCount: 18,
      maxUses: 100,
      requiredTier: 'Rouge',
      isActive: true,
    },
    {
      code: 'WELCOME15',
      description: '15% off your first Sayphora order.',
      discountPercent: 15,
      minSpend: 50,
      usageCount: 42,
      maxUses: 500,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      description: 'Complimentary standard shipping on orders over $75.',
      freeShipping: true,
      minSpend: 75,
      usageCount: 93,
      isActive: true,
    },
  ];
}

function seedState(): DemoState {
  const products = seedProducts();
  const seededReviews = clone(MOCK_REVIEWS) as unknown as Record<string, Review[]>;
  return {
    users: seedUsers(),
    products,
    reviews: seededReviews,
    orders: seedOrders(),
    promos: seedPromos(),
    redemptions: { 'demo-admin': [] },
    nextUserId: 3,
    nextOrderNumber: 10483,
  };
}

function readState(): DemoState {
  const raw = window.localStorage.getItem(STATE_KEY);
  if (!raw) {
    const state = seedState();
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return state;
  }
  try {
    const state = JSON.parse(raw) as DemoState;
    if (!Array.isArray(state.users) || !Array.isArray(state.products) || !Array.isArray(state.orders)) {
      throw new Error('Invalid demo state');
    }
    return state;
  } catch {
    const state = seedState();
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return state;
  }
}

function writeState(state: DemoState): void {
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function publicUser(user: DemoUser): User {
  const { password: _password, wishlist: _wishlist, ...safe } = user;
  return clone(safe);
}

function currentUser(state: DemoState): DemoUser | null {
  const id = window.sessionStorage.getItem(SESSION_KEY);
  return id ? state.users.find((user) => user.id === id) ?? null : null;
}

function requireUser(state: DemoState): DemoUser {
  return currentUser(state) ?? fail('Please sign in to continue.', 401, 'unauthorized');
}

function requireStaff(state: DemoState): DemoUser {
  const user = requireUser(state);
  if (user.role !== 'Admin' && user.role !== 'Staff') fail('Staff access required in the demo.', 403, 'forbidden');
  return user;
}

function findProduct(state: DemoState, id: string): Product {
  return state.products.find((product) => product.id === id && product.status !== 'Archived')
    ?? fail('Product not found.', 404, 'not_found');
}

function normalizePath(path: string): string {
  return path.split('?')[0].replace(/\/+$/, '') || '/';
}

function calculateTotals(
  state: DemoState,
  body: {
    items: Array<{ productId: string; quantity: number }>;
    shippingMethod: 'Standard' | 'Express' | 'Next-Day';
    promoCode?: string;
    giftOption?: { isGift?: boolean };
  },
) {
  const lines = body.items.map((item) => {
    const product = findProduct(state, item.productId);
    const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
    if ((product.stockLeft ?? 0) < quantity) {
      fail(\`Only \${product.stockLeft ?? 0} unit(s) of \${product.name} are available.\`, 409, 'out_of_stock');
    }
    return { product, quantity };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  let discount = 0;
  let appliedPromo: PromoCode | undefined;

  if (body.promoCode) {
    appliedPromo = state.promos.find((promo) => promo.code === String(body.promoCode).toUpperCase() && promo.isActive);
    if (appliedPromo && subtotal >= (appliedPromo.minSpend ?? 0)) {
      discount = appliedPromo.discountPercent
        ? subtotal * (appliedPromo.discountPercent / 100)
        : Math.min(subtotal, appliedPromo.discountAmount ?? 0);
    }
  }

  const shipping = appliedPromo?.freeShipping || subtotal - discount >= 75
    ? 0
    : body.shippingMethod === 'Express'
      ? 14
      : body.shippingMethod === 'Next-Day'
        ? 28
        : 6.5;
  const giftFee = body.giftOption?.isGift ? 8 : 0;
  const tax = Math.max(0, subtotal - discount + shipping + giftFee) * 0.08875;
  const total = subtotal - discount + shipping + giftFee + tax;
  return { lines, subtotal, discount, shipping, giftFee, tax, total, appliedPromo };
}

function buildOrder(state: DemoState, user: DemoUser, body: any): Order {
  const totals = calculateTotals(state, body);
  const createdAt = now();
  const orderNumber = \`SPH-\${state.nextOrderNumber++}\`;
  const address = body.shippingAddress as Address;
  const events = [
    { status: 'Processing', note: 'Order confirmed by Sayphora demo.', at: createdAt },
  ];
  const items = totals.lines.map(({ product, quantity }) => ({
    id: uid('item'),
    productId: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    image: product.image,
    shadeId: body.items.find((i: any) => i.productId === product.id)?.shadeId,
    shadeName: product.shades?.find((s) => s.id === body.items.find((i: any) => i.productId === product.id)?.shadeId)?.name,
    shadeHex: product.shades?.find((s) => s.id === body.items.find((i: any) => i.productId === product.id)?.shadeId)?.hex,
    size: body.items.find((i: any) => i.productId === product.id)?.size,
    quantity,
    unitPrice: product.price,
  }));

  const trackingNumber = \`SPH-DEMO-\${state.nextOrderNumber}\`;
  const order: Order = {
    id: uid('order'),
    orderNumber,
    date: new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    createdAt,
    customerEmail: user.email,
    items,
    samples: clone(COMPLIMENTARY_SAMPLES.slice(0, 1)) as FreeSample[],
    subtotal: Number(totals.subtotal.toFixed(2)),
    discount: Number(totals.discount.toFixed(2)),
    giftFee: Number(totals.giftFee.toFixed(2)),
    tax: Number(totals.tax.toFixed(2)),
    shipping: Number(totals.shipping.toFixed(2)),
    total: Number(totals.total.toFixed(2)),
    currency: 'USD',
    promoCode: totals.appliedPromo?.code,
    shippingAddress: address,
    shippingMethod: body.shippingMethod ?? 'Standard',
    paymentMethod: 'Manual / Pay on Delivery',
    paymentStatus: 'Paid',
    giftOption: body.giftOption,
    status: 'Processing',
    carrier: 'DHL Express',
    trackingNumber,
    estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    pointsEarned: Math.floor(totals.total),
    events,
  };

  for (const line of totals.lines) {
    const product = findProduct(state, line.product.id);
    product.stockLeft = Math.max(0, (product.stockLeft ?? 0) - line.quantity);
  }

  user.points += order.pointsEarned;
  user.pointsToNextTier = Math.max(0, user.pointsToNextTier - order.pointsEarned);
  state.orders.unshift(order);
  return order;
}

function adminAnalytics(state: DemoState): SalesAnalytics {
  const liveOrders = state.orders.filter((order) => order.status !== 'Cancelled');
  const revenue = liveOrders.reduce((sum, order) => sum + order.total, 0);
  const categoryBreakdown: Record<string, number> = {};
  for (const order of liveOrders) {
    for (const item of order.items) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] ?? 0) + item.unitPrice * item.quantity;
    }
  }
  const ordersByStatus: Record<string, number> = {};
  for (const order of state.orders) ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;

  return {
    totalRevenue: Number(revenue.toFixed(2)),
    totalOrders: liveOrders.length,
    averageOrderValue: liveOrders.length ? Number((revenue / liveOrders.length).toFixed(2)) : 0,
    activeCustomers: state.users.filter((u) => u.role === 'Customer').length,
    totalCustomers: state.users.length,
    newCustomers30d: 12,
    returnRate: 0.04,
    sampleAttachRate: 0.31,
    categoryBreakdown,
    revenueByDay: Array.from({ length: 7 }, (_, index) => ({
      day: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10),
      revenue: index === 6 ? Number(revenue.toFixed(2)) : Math.round(revenue * (0.55 + index * 0.06) / 7),
    })),
    ordersByStatus,
    lowStockCount: state.products.filter((p) => p.status === 'Active' && (p.stockLeft ?? 0) <= 5).length,
    outOfStockCount: state.products.filter((p) => p.status === 'Active' && (p.stockLeft ?? 0) === 0).length,
    ai: {
      byKind: {
        'shade-match': { gemini: 18, fallback: 4 },
        'skincare-routine': { gemini: 12, fallback: 3 },
        'beauty-consultant': { gemini: 26, fallback: 7 },
        'store-locator': { gemini: 9, fallback: 14 },
      },
      undertones: [
        { undertone: 'Neutral', count: 34 },
        { undertone: 'Warm', count: 28 },
        { undertone: 'Cool', count: 18 },
        { undertone: 'Olive', count: 11 },
      ],
      geminiConfigured: false,
    },
    boutiques: { count: 28, cities: 12 },
  };
}

function rewards(): Reward[] {
  return [
    { id: 'reward-25', title: '$25 Beauty Credit', description: 'Use 2,500 points for $25 off a qualifying order.', costPoints: 2500, value: 25 },
    { id: 'reward-50', title: '$50 Beauty Credit', description: 'Use 4,500 points for $50 off a qualifying order.', costPoints: 4500, value: 50 },
    { id: 'reward-mini', title: 'Deluxe Discovery Set', description: 'Redeem a curated five-piece mini set.', costPoints: 1500, value: 35 },
  ];
}

const boutiqueDirectory: BoutiquePlace[] = [
  {
    id: 'nyc-001',
    name: 'Sayphora Atelier SoHo',
    address: '101 Spring St, New York, NY',
    uri: 'https://www.google.com/maps/search/?api=1&query=101+Spring+St+New+York',
    rating: 4.9,
    reviewsCount: 312,
    phone: '+1 212 555 0110',
    openNow: true,
    distance: '0.8 mi',
    services: ['Shade Matching Bar', 'Same-Day Pickup', 'Fragrance Atelier'],
    inStockItems: ['Pro Filt\\'r Foundation', 'Soft Pinch Liquid Blush'],
    snippets: ['Beautifully curated and calm.', 'The shade-matching service was excellent.'],
    source: 'verified_atelier',
  },
  {
    id: 'london-001',
    name: 'Sayphora Mayfair Beauty House',
    address: '16 New Bond St, London W1S',
    uri: 'https://www.google.com/maps/search/?api=1&query=16+New+Bond+Street+London',
    rating: 4.8,
    reviewsCount: 207,
    phone: '+44 20 7946 0112',
    openNow: true,
    distance: '1.2 mi',
    services: ['Clinical Facial Spa', 'Shade Matching Bar'],
    inStockItems: ['Hollywood Flawless Filter'],
    snippets: ['A gorgeous destination for beauty lovers.'],
    source: 'verified_atelier',
  },
  {
    id: 'tokyo-001',
    name: 'Sayphora Ginza Studio',
    address: '5-7-2 Ginza, Chuo City, Tokyo',
    uri: 'https://www.google.com/maps/search/?api=1&query=5-7-2+Ginza+Tokyo',
    rating: 4.9,
    reviewsCount: 188,
    phone: '+81 3 5550 0113',
    openNow: true,
    distance: '0.6 mi',
    services: ['Fragrance Atelier', 'Same-Day Pickup'],
    inStockItems: ['Tatcha Water Cream'],
    snippets: ['Excellent service and discovery experience.'],
    source: 'verified_atelier',
  },
];

export async function demoRequest<T>(path: string, opts: {
  method?: string;
  body?: unknown;
} = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const state = readState();
  const method = (opts.method ?? (opts.body !== undefined ? 'POST' : 'GET')).toUpperCase();
  const clean = normalizePath(path);
  const body = (opts.body ?? {}) as any;

  if (clean === '/health') return { ok: true, demo: true, time: now() } as T;
  if (clean === '/config') return { pricing: { taxRate: 0.08875, standardShipping: 6.5, expressShipping: 14, nextDayShipping: 28, freeShippingThreshold: 75 }, payment: { provider: 'manual' } } as T;
  if (clean === '/samples') return { samples: clone(COMPLIMENTARY_SAMPLES) } as T;
  if (clean === '/products') return { products: clone(state.products.filter((p) => p.status !== 'Archived')) } as T;
  if (clean === '/auth/me') {
    const user = currentUser(state);
    return { user: user ? publicUser(user) : null } as T;
  }

  if (clean === '/auth/login' && method === 'POST') {
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const user = state.users.find((candidate) => candidate.email === email && candidate.password === password);
    if (!user) fail('Email or password is incorrect.', 401, 'invalid_credentials');
    window.sessionStorage.setItem(SESSION_KEY, user.id);
    return { user: publicUser(user) } as T;
  }

  if (clean === '/auth/register' && method === 'POST') {
    const email = String(body.email ?? '').trim().toLowerCase();
    const name = String(body.name ?? '').trim();
    const password = String(body.password ?? '');
    if (!name) fail('Name is required.', 422, 'validation_error', { name: 'Name is required.' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('Enter a valid email address.', 422, 'validation_error', { email: 'Enter a valid email address.' });
    if (password.length < 10) fail('Use at least 10 characters.', 422, 'validation_error', { password: 'Use at least 10 characters.' });
    if (state.users.some((user) => user.email === email)) fail('An account with that email already exists.', 409, 'conflict');
    const user: DemoUser = {
      id: \`demo-user-\${state.nextUserId++}\`,
      name,
      email,
      password,
      role: 'Customer',
      tier: 'Insider',
      points: 50,
      pointsToNextTier: 950,
      beautyProfile: { skinType: 'All', skinTone: 'Medium', undertone: 'Neutral', concerns: [], favoriteBrands: [] },
      savedAddresses: [],
      wishlist: [],
    };
    state.users.push(user);
    writeState(state);
    window.sessionStorage.setItem(SESSION_KEY, user.id);
    return { user: publicUser(user) } as T;
  }

  if (clean === '/auth/logout' && method === 'POST') {
    window.sessionStorage.removeItem(SESSION_KEY);
    return { ok: true } as T;
  }
  if (clean === '/auth/forgot-password' && method === 'POST') {
    return { message: 'Demo mode: a password reset link would be sent to this address.' } as T;
  }
  if (clean === '/auth/reset-password' && method === 'POST') return { ok: true } as T;

  if (clean === '/me/orders') {
    const user = requireUser(state);
    return { orders: clone(state.orders.filter((order) => order.customerEmail === user.email)) } as T;
  }

  if (clean === '/me/wishlist/merge' && method === 'POST') {
    const user = requireUser(state);
    const ids = Array.isArray(body.productIds) ? body.productIds : [];
    user.wishlist = [...new Set([...user.wishlist, ...ids.filter((id: string) => state.products.some((p) => p.id === id))])];
    writeState(state);
    return { productIds: clone(user.wishlist) } as T;
  }

  if (clean.startsWith('/me/wishlist/') && method === 'PUT') {
    const user = requireUser(state);
    const id = decodeURIComponent(clean.split('/').pop()!);
    user.wishlist = [...new Set([...user.wishlist, id])];
    writeState(state);
    return { productIds: clone(user.wishlist) } as T;
  }

  if (clean.startsWith('/me/wishlist/') && method === 'DELETE') {
    const user = requireUser(state);
    const id = decodeURIComponent(clean.split('/').pop()!);
    user.wishlist = user.wishlist.filter((entry) => entry !== id);
    writeState(state);
    return { ok: true } as T;
  }

  if (clean === '/promos/validate' && method === 'POST') {
    const user = currentUser(state);
    const code = String(body.code ?? '').trim().toUpperCase();
    const subtotal = Number(body.subtotal ?? 0);
    const promo = state.promos.find((entry) => entry.code === code && entry.isActive);
    if (!promo) fail('That promo code is not active in the demo.', 400, 'invalid_promo');
    if (subtotal < (promo.minSpend ?? 0)) fail(\`Spend at least $\${promo.minSpend} to use \${promo.code}.\`, 400, 'minimum_spend');
    if (promo.requiredTier && user?.tier !== promo.requiredTier) fail(\`This offer is for \${promo.requiredTier} members.\`, 403, 'tier_required');
    return { promo: clone(promo) } as T;
  }

  if (clean === '/orders' && method === 'POST') {
    const user = requireUser(state);
    if (!Array.isArray(body.items) || !body.items.length) fail('Your bag is empty.', 400, 'empty_cart');
    const order = buildOrder(state, user, body);
    writeState(state);
    return { order: clone(order) } as T;
  }

  if (clean.startsWith('/orders/') && clean.endsWith('/cancel') && method === 'POST') {
    const user = requireUser(state);
    const id = clean.split('/')[2];
    const order = state.orders.find((candidate) => candidate.id === id && candidate.customerEmail === user.email);
    if (!order) fail('Order not found.', 404, 'not_found');
    if (order.status === 'Delivered' || order.status === 'Cancelled') fail('This order can no longer be cancelled.', 409, 'invalid_state');
    order.status = 'Cancelled';
    order.events.push({ status: 'Cancelled', note: 'Cancelled in Sayphora demo.', at: now() });
    writeState(state);
    return { order: clone(order) } as T;
  }

  if (clean === '/me') {
    const user = requireUser(state);
    if (method === 'PATCH') {
      user.beautyProfile = { ...user.beautyProfile, ...(body.beautyProfile ?? {}) };
      user.name = body.name ? String(body.name) : user.name;
      user.phone = body.phone !== undefined ? body.phone : user.phone;
      writeState(state);
    }
    return { user: publicUser(user) } as T;
  }

  if (clean === '/me/addresses' && method === 'POST') {
    const user = requireUser(state);
    user.savedAddresses.push({ ...(body as Address), id: uid('addr') });
    writeState(state);
    return { address: clone(user.savedAddresses[user.savedAddresses.length - 1]) } as T;
  }

  if (clean.startsWith('/me/addresses/') && method === 'DELETE') {
    const user = requireUser(state);
    const id = clean.split('/').pop();
    user.savedAddresses = user.savedAddresses.filter((address) => address.id !== id);
    writeState(state);
    return { ok: true } as T;
  }

  if (clean === '/me/rewards') {
    const user = requireUser(state);
    return { rewards: rewards(), redemptions: clone(state.redemptions[user.id] ?? []) } as T;
  }

  if (clean.startsWith('/me/rewards/') && clean.endsWith('/redeem') && method === 'POST') {
    const user = requireUser(state);
    const rewardId = clean.split('/')[3];
    const reward = rewards().find((entry) => entry.id === rewardId);
    if (!reward) fail('Reward not found.', 404, 'not_found');
    if (user.points < reward.costPoints) fail('You do not have enough points for this reward.', 400, 'insufficient_points');
    const code = \`SAY-\${Math.random().toString(36).slice(2, 8).toUpperCase()}\`;
    const redemption: RewardRedemption = {
      id: uid('redemption'),
      code,
      title: reward.title,
      pointsSpent: reward.costPoints,
      createdAt: now(),
      used: false,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    user.points -= reward.costPoints;
    const list = state.redemptions[user.id] ?? [];
    state.redemptions[user.id] = [redemption, ...list];
    writeState(state);
    return { code, title: reward.title, value: reward.value } as T;
  }

  if (clean.match(/^\/products\/[^/]+\/reviews$/)) {
    const productId = decodeURIComponent(clean.split('/')[2]);
    if (method === 'GET') return { reviews: clone(state.reviews[productId] ?? []) } as T;
    const user = requireUser(state);
    const review: Review = {
      id: uid('review'),
      productId,
      userName: user.name,
      userBadge: user.tier + ' Member',
      rating: Math.max(1, Math.min(5, Number(body.rating ?? 5))),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: String(body.title ?? 'Loved it'),
      comment: String(body.comment ?? ''),
      verifiedPurchase: true,
      shadeUsed: body.shadeUsed,
      recommended: Boolean(body.recommended),
      helpfulCount: 0,
    };
    state.reviews[productId] = [review, ...(state.reviews[productId] ?? [])];
    const product = state.products.find((entry) => entry.id === productId);
    if (product) product.reviewCount += 1;
    writeState(state);
    return { review: clone(review) } as T;
  }

  if (clean.startsWith('/reviews/') && clean.endsWith('/vote') && method === 'POST') {
    requireUser(state);
    const reviewId = clean.split('/')[2];
    const review = Object.values(state.reviews).flat().find((entry) => entry.id === reviewId) ?? fail('Review not found.', 404, 'not_found');
    const vote = body.vote as 'helpful' | 'unhelpful' | 'none';
    review.userVotedHelpful = vote === 'helpful';
    review.userVotedUnhelpful = vote === 'unhelpful';
    if (vote === 'helpful') review.helpfulCount += 1;
    if (vote === 'unhelpful') review.unhelpfulCount = (review.unhelpfulCount ?? 0) + 1;
    writeState(state);
    return { review: clone(review) } as T;
  }

  if (clean.startsWith('/reviews/') && method === 'DELETE') {
    requireStaff(state);
    const reviewId = clean.split('/')[2];
    for (const productId of Object.keys(state.reviews)) state.reviews[productId] = state.reviews[productId].filter((entry) => entry.id !== reviewId);
    writeState(state);
    return { ok: true } as T;
  }

  if (clean === '/admin/products') {
    requireStaff(state);
    if (method === 'GET') return { products: clone(state.products) } as T;
    const product = { ...(body as Product), id: body.id ?? uid('product'), status: body.status ?? 'Active', rating: body.rating ?? 0, reviewCount: body.reviewCount ?? 0 } as Product;
    state.products.unshift(product);
    writeState(state);
    return { product: clone(product) } as T;
  }

  if (clean.startsWith('/admin/products/') && clean.endsWith('/stock') && method === 'PATCH') {
    requireStaff(state);
    const id = clean.split('/')[3];
    const product = state.products.find((entry) => entry.id === id) ?? fail('Product not found.', 404, 'not_found');
    product.stockLeft = Math.max(0, Number(body.stock) || 0);
    writeState(state);
    return { product: clone(product) } as T;
  }

  if (clean.startsWith('/admin/products/') && method === 'PUT') {
    requireStaff(state);
    const id = clean.split('/')[3];
    const product = state.products.find((entry) => entry.id === id) ?? fail('Product not found.', 404, 'not_found');
    Object.assign(product, body);
    writeState(state);
    return { product: clone(product) } as T;
  }

  if (clean.startsWith('/admin/products/') && method === 'DELETE') {
    requireStaff(state);
    const id = clean.split('/')[3];
    const product = state.products.find((entry) => entry.id === id) ?? fail('Product not found.', 404, 'not_found');
    product.status = 'Archived';
    writeState(state);
    return { ok: true, id, status: 'Archived' } as T;
  }

  if (clean === '/admin/orders' && method === 'GET') {
    requireStaff(state);
    return { count: state.orders.length, orders: clone(state.orders) } as T;
  }

  if (clean.startsWith('/admin/orders/') && method === 'PATCH') {
    requireStaff(state);
    const id = clean.split('/')[3];
    const order = state.orders.find((entry) => entry.id === id) ?? fail('Order not found.', 404, 'not_found');
    if (body.status) {
      order.status = body.status as OrderStatus;
      order.events.push({ status: body.status as string, note: 'Status updated in Sayphora demo.', at: now() });
    }
    if (body.trackingNumber) order.trackingNumber = String(body.trackingNumber);
    if (body.carrier) order.carrier = String(body.carrier);
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    writeState(state);
    return { order: clone(order), refundRequired: false } as T;
  }

  if (clean === '/admin/reviews' && method === 'GET') {
    requireStaff(state);
    const reviews = Object.entries(state.reviews).flatMap(([productId, entries]) => {
      const product = state.products.find((entry) => entry.id === productId);
      return entries.map((entry) => ({ ...entry, productTitle: product?.name ?? productId, productBrand: product?.brand ?? '' }));
    });
    return { reviews: clone(reviews) } as T;
  }

  if (clean === '/admin/analytics' && method === 'GET') {
    requireStaff(state);
    return adminAnalytics(state) as T;
  }

  if (clean === '/admin/promos' && method === 'GET') {
    requireStaff(state);
    return { promos: clone(state.promos) } as T;
  }

  if (clean === '/admin/promos' && method === 'POST') {
    requireStaff(state);
    const promo = clone(body as PromoCode);
    promo.code = promo.code.trim().toUpperCase();
    promo.isActive = promo.isActive ?? true;
    state.promos.push(promo);
    writeState(state);
    return { promo } as T;
  }

  if (clean.startsWith('/admin/promos/') && method === 'PATCH') {
    requireStaff(state);
    const code = decodeURIComponent(clean.split('/').pop()!).toUpperCase();
    const promo = state.promos.find((entry) => entry.code === code) ?? fail('Promo code not found.', 404, 'not_found');
    if (body.isActive !== undefined) promo.isActive = Boolean(body.isActive);
    writeState(state);
    return { promo: clone(promo) } as T;
  }

  if (clean.startsWith('/admin/promos/') && method === 'DELETE') {
    requireStaff(state);
    const code = decodeURIComponent(clean.split('/').pop()!).toUpperCase();
    state.promos = state.promos.filter((entry) => entry.code !== code);
    writeState(state);
    return { ok: true } as T;
  }

  if (clean === '/ai/skincare-routine' && method === 'POST') {
    return {
      source: 'demo',
      title: 'Personalized barrier-support routine',
      steps: [
        { order: 1, time: 'AM', productId: 'glow-recipe-dew-drops', productName: 'Glow Recipe Dew Drops', rationale: 'Adds lightweight hydration and radiance.' },
        { order: 2, time: 'AM', productId: 'tatcha-water-cream', productName: 'Tatcha The Water Cream', rationale: 'Supports a comfortable, balanced finish.' },
        { order: 3, time: 'PM', productId: 'tatcha-water-cream', productName: 'Tatcha The Water Cream', rationale: 'Replenishes moisture overnight.' },
      ],
      guidance: 'Demo recommendations are generated from the supplied profile and sample catalogue.',
    } as T;
  }

  if (clean === '/ai/beauty-consultant' && method === 'POST') {
    const prompt = String(body.prompt ?? '').trim();
    return {
      source: 'demo',
      answer: prompt
        ? \`For “\${prompt}”, I would start with a lightweight complexion base, a soft-pinch cheek color, and a barrier-first skincare prep. In this demo, the strongest starting points are Fenty Pro Filt'r, Rare Beauty Soft Pinch, and Tatcha Water Cream.\`
        : 'Tell me your skin type, finish preference, or the occasion you are shopping for.',
    } as T;
  }

  if (clean === '/ai/shade-match' && method === 'POST') {
    return {
      source: 'demo',
      match: {
        productId: 'fenty-pro-filtr-foundation',
        productName: "Pro Filt'r Soft Matte Longwear Liquid Foundation",
        shadeId: body.skinDepth === 'Deep' ? '420' : body.veinUndertone === 'Cool' ? '185' : '230',
        shadeName: body.skinDepth === 'Deep' ? '420 - Deep with Warm undertones' : body.veinUndertone === 'Cool' ? '185 - Light Medium with Neutral undertones' : '230 - Medium with Warm undertones',
        confidence: 0.92,
      },
      sourceDetail: 'Demo shade engine; no external AI call is made.',
    } as T;
  }

  if (clean === '/ai/store-locator' && method === 'POST') {
    const city = String(body.city ?? '').toLowerCase();
    const places = boutiqueDirectory.filter((place) => {
      if (!city || city === 'all') return true;
      return place.name.toLowerCase().includes(city) || place.address?.toLowerCase().includes(city);
    });
    return {
      summary: city ? \`Demo boutique directory for \${body.city}. No external maps grounding is used.\` : 'Featured Sayphora boutique directory for the demo.',
      places: clone(places.length ? places : boutiqueDirectory),
      searchQueries: body.query ? [String(body.query)] : [],
      source: 'verified_catalog',
    } as T;
  }

  return fail(\`The demo adapter does not implement \${method} \${path}.\`, 501, 'demo_not_implemented');
}
