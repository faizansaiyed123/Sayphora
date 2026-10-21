import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Product, CartItem, Shade, PromoCode, FreeSample, User, Order, FilterState, Category, Address, Currency,
  ToastMessage, GiftOption, OrderStatus, SalesAnalytics, BoutiquePlace, Review, Reward, RewardRedemption
} from '../types';
import { api, ApiError, errorMessage } from '../lib/api';
import {
  computePricing, DEFAULT_PRICING_RULES, toCents, SAMPLE_MIN_SPEND_CENTS, type PricingResult, type PricingRules, type ShippingMethod, type PromoRule
} from '../../shared/commerce';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';
type AiTab = 'shade' | 'routine' | 'chat';
type ToastType = 'success' | 'info' | 'luxury' | 'warning';
type NewProduct = Omit<Product, 'id' | 'rating' | 'reviewCount'> & Partial<Pick<Product, 'rating' | 'reviewCount'>>;
type AdminReview = Review & { productTitle: string; productBrand: string };

interface CartLine { id: string; productId: string; shadeId?: string; size?: string; quantity: number }

export interface AppContextType {
  // Catalogue & data loading
  products: Product[];
  filteredProducts: Product[];
  productsLoading: boolean;
  productsError: string | null;
  reloadProducts: () => Promise<void>;
  samples: FreeSample[];
  cart: CartItem[];
  wishlist: string[];
  appliedPromo: PromoCode | null;
  selectedSamples: FreeSample[];
  user: User | null;
  authLoading: boolean;
  orders: Order[];
  filters: FilterState;
  pricingRules: PricingRules;
  paymentProvider: string;
  computeCartPricing: (shippingMethod?: ShippingMethod, gift?: { isGift: boolean; giftWrapType?: GiftOption['giftWrapType'] }) => PricingResult;

  // Currency (display only; all charges are in USD)
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInUSD: number) => string;

  // UI state
  quickViewProduct: Product | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthModalOpen: boolean;
  authMode: AuthMode;
  resetToken: string | null;
  isBeautyInsiderOpen: boolean;
  isAIStudioOpen: boolean;
  aiStudioTab: AiTab;
  isOrderTrackingOpen: boolean;
  trackedOrderNumber: string;

  isVTOOpen: boolean;
  vtoProduct: Product | null;
  vtoShade: Shade | null;
  openVTO: (product?: Product, shade?: Shade) => void;
  closeVTO: () => void;

  comparedProducts: Product[];
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;

  isIngredientModalOpen: boolean;
  ingredientProduct: Product | null;
  openIngredientModal: (product: Product) => void;
  closeIngredientModal: () => void;

  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  giftOption: GiftOption;
  setGiftOption: React.Dispatch<React.SetStateAction<GiftOption>>;
  viewMode: 'grid' | 'editorial';
  setViewMode: React.Dispatch<React.SetStateAction<'grid' | 'editorial'>>;

  // Admin / staff
  isStaff: boolean;
  isAdmin: boolean;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminLoading: boolean;
  refreshAdmin: () => Promise<void>;
  adminProducts: Product[];
  adminOrders: Order[];
  adminReviews: AdminReview[];
  addProduct: (product: NewProduct) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, extra?: { trackingNumber?: string; carrier?: string }) => Promise<boolean>;
  updateOrderTracking: (orderId: string, trackingNumber: string, carrier?: string) => Promise<boolean>;
  markOrderPaid: (orderId: string) => Promise<void>;
  promos: PromoCode[];
  createPromo: (promo: PromoCode) => Promise<boolean>;
  togglePromoActive: (code: string, isActive: boolean) => Promise<void>;
  deletePromo: (code: string) => Promise<void>;
  analytics: SalesAnalytics;

  // Actions
  setQuickViewProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: AuthMode) => void;
  setIsBeautyInsiderOpen: (open: boolean) => void;
  openAIStudio: (tab?: AiTab) => void;
  closeAIStudio: () => void;
  setAiStudioTab: (tab: AiTab) => void;
  openOrderTracking: (orderNumber?: string) => void;
  closeOrderTracking: () => void;

  isStoreLocatorOpen: boolean;
  setIsStoreLocatorOpen: (open: boolean) => void;
  storeLocatorQuery: string;
  storeLocatorBrand: string;
  selectedBoutique: BoutiquePlace | null;
  setSelectedBoutique: (boutique: BoutiquePlace | null) => void;
  openStoreLocator: (query?: string, brand?: string) => void;
  closeStoreLocator: () => void;

  // Reviews
  reviews: Record<string, Review[]>;
  reviewsLoading: Record<string, boolean>;
  loadReviews: (productId: string) => Promise<void>;
  getProductReviews: (productId: string) => Review[];
  addReview: (productId: string, review: { rating: number; title: string; comment: string; shadeUsed?: string; recommended?: boolean; photos?: string[] }) => Promise<void>;
  voteReview: (productId: string, reviewId: string, type: 'helpful' | 'unhelpful') => Promise<void>;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;

  // Cart & orders
  addToCart: (product: Product, selectedShade?: Shade, selectedSize?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
  toggleSample: (sample: FreeSample) => void;
  createOrder: (shippingAddress: Address, shippingMethod: ShippingMethod, giftOption?: GiftOption) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveAllWishlistToBag: () => void;

  // Filters
  setCategory: (category: Category) => void;
  setSearchQuery: (query: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Auth & profile
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateBeautyProfile: (profile: Partial<User['beautyProfile']>) => Promise<void>;
  saveAddress: (address: Address) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  rewards: Reward[];
  redemptions: RewardRedemption[];
  loadRewards: () => Promise<void>;
  redeemReward: (rewardId: string) => Promise<{ code: string; title: string; value: number } | null>;
}

const DEFAULT_FILTERS: FilterState = {
  category: 'All', minPrice: 0, maxPrice: 1000, cleanOnly: false, saleOnly: false, sortBy: 'featured', searchQuery: ''
};

const EMPTY_ANALYTICS: SalesAnalytics = {
  totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, activeCustomers: 0, totalCustomers: 0, newCustomers30d: 0,
  returnRate: 0, sampleAttachRate: 0, categoryBreakdown: {}, revenueByDay: [], ordersByStatus: {}, lowStockCount: 0,
  outOfStockCount: 0, ai: { byKind: {}, undertones: [], geminiConfigured: false }, boutiques: { count: 0, cities: 0 }
};

// Indicative display rates only: every order is charged in USD.
const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string; prefix: boolean }> = {
  USD: { rate: 1.0, symbol: '$', prefix: true },
  EUR: { rate: 0.92, symbol: '€', prefix: false },
  GBP: { rate: 0.79, symbol: '£', prefix: true },
  CAD: { rate: 1.37, symbol: 'CA$', prefix: true },
  AUD: { rate: 1.54, symbol: 'A$', prefix: true },
  JPY: { rate: 152.0, symbol: '¥', prefix: true }
};

const MAX_LINE_QTY = 10;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable (private mode / quota) */ }
}

const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ----------------------------------------------------------- toasts ----
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((title: string, description?: string, type: ToastType = 'luxury') => {
    const id = `toast-${uid()}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, description, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);
  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const fail = useCallback((err: unknown, title = 'Something went wrong') => addToast(title, errorMessage(err), 'warning'), [addToast]);

  // ------------------------------------------------- bootstrap data ----
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [samples, setSamples] = useState<FreeSample[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRules>(DEFAULT_PRICING_RULES);
  const [paymentProvider, setPaymentProvider] = useState('manual');

  const reloadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await api<{ products: Product[] }>('/products?limit=500');
      setProducts(data.products);
      setProductsError(null);
    } catch (err) {
      setProductsError(errorMessage(err));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------ auth ----
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage<string[]>('sayphora_wishlist', []));
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);

  const refreshOrders = useCallback(async () => {
    try { setOrders((await api<{ orders: Order[] }>('/me/orders')).orders); } catch { /* shown on demand */ }
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: u } = await api<{ user: User | null }>('/auth/me');
    setUser(u);
    return u;
  }, []);

  /** After sign-in/up: fold the guest wishlist into the account and load account data. */
  const hydrateAccount = useCallback(async (u: User) => {
    setUser(u);
    try {
      const guest = readStorage<string[]>('sayphora_wishlist', []);
      const { productIds } = await api<{ productIds: string[] }>('/me/wishlist/merge', { body: { productIds: guest } });
      setWishlist(productIds);
    } catch { /* wishlist sync is best-effort */ }
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      reloadProducts();
      api<{ pricing: PricingRules; payment: { provider: string } }>('/config')
        .then((c) => { if (!cancelled) { setPricingRules(c.pricing); setPaymentProvider(c.payment.provider); } })
        .catch(() => undefined);
      api<{ samples: FreeSample[] }>('/samples').then((r) => !cancelled && setSamples(r.samples)).catch(() => undefined);
      try {
        const u = await refreshUser();
        if (u && !cancelled) await hydrateAccount(u);
      } catch { /* anonymous */ }
      if (!cancelled) setAuthLoading(false);
    })();
    return () => { cancelled = true; };
  }, [reloadProducts, refreshUser, hydrateAccount]);

  useEffect(() => { if (!user) writeStorage('sayphora_wishlist', wishlist); }, [wishlist, user]);

  // ---------------------------------------------------------- UI state ----
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isBeautyInsiderOpen, setIsBeautyInsiderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [aiStudioTab, setAiStudioTab] = useState<AiTab>('shade');
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'editorial'>('grid');
  const [isVTOOpen, setIsVTOOpen] = useState(false);
  const [vtoProduct, setVtoProduct] = useState<Product | null>(null);
  const [vtoShade, setVtoShade] = useState<Shade | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientProduct, setIngredientProduct] = useState<Product | null>(null);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [storeLocatorQuery, setStoreLocatorQuery] = useState('');
  const [storeLocatorBrand, setStoreLocatorBrand] = useState('');
  const [selectedBoutique, setSelectedBoutique] = useState<BoutiquePlace | null>(null);
  const [giftOption, setGiftOption] = useState<GiftOption>({ isGift: false, giftWrapType: 'Signature Black & Gold Box', cardMessage: '' });
  const [currency, setCurrency] = useState<Currency>('USD');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Password-reset deep link: /?reset=<token>
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('reset');
    if (token) {
      setResetToken(token);
      setAuthMode('reset');
      setIsAuthModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const openStoreLocator = (query = '', brand = '') => { setStoreLocatorQuery(query); setStoreLocatorBrand(brand); setIsStoreLocatorOpen(true); };
  const closeStoreLocator = () => setIsStoreLocatorOpen(false);

  const formatPrice = (amountInUSD: number): string => {
    const curr = CURRENCY_RATES[currency];
    const converted = amountInUSD * curr.rate;
    if (currency === 'JPY') return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
    const formatted = converted.toFixed(2);
    return curr.prefix ? `${curr.symbol}${formatted}` : `${formatted} ${curr.symbol}`;
  };

  // -------------------------------------------------------------- cart ----
  const [cartLines, setCartLines] = useState<CartLine[]>(() => readStorage<CartLine[]>('sayphora_cart_v2', []));
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedSamples, setSelectedSamples] = useState<FreeSample[]>([]);
  const checkoutKey = useRef<string>(uid());

  useEffect(() => { writeStorage('sayphora_cart_v2', cartLines); }, [cartLines]);

  // Cart items are always rendered from the live catalogue, so stale prices can never be shown.
  const cart: CartItem[] = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return cartLines.flatMap((l) => {
      const product = byId.get(l.productId);
      if (!product) return [];
      return [{ id: l.id, product, selectedShade: product.shades?.find((s) => s.id === l.shadeId), selectedSize: l.size, quantity: l.quantity }];
    });
  }, [cartLines, products]);

  // Drop lines for products that no longer exist, and clamp quantities to available stock.
  useEffect(() => {
    if (!products.length) return;
    const byId = new Map(products.map((p) => [p.id, p]));
    setCartLines((lines) => {
      const next = lines.flatMap((l) => {
        const p = byId.get(l.productId);
        if (!p || (p.stockLeft ?? 1) <= 0) return [];
        return [{ ...l, quantity: Math.min(l.quantity, MAX_LINE_QTY, p.stockLeft ?? MAX_LINE_QTY) }];
      });
      return JSON.stringify(next) === JSON.stringify(lines) ? lines : next;
    });
  }, [products]);

  const addToCart = (product: Product, selectedShade?: Shade, selectedSize?: string, quantity = 1) => {
    const available = product.stockLeft ?? MAX_LINE_QTY;
    if (available <= 0) { addToast('Currently sold out', product.name, 'warning'); return; }
    const shade = selectedShade ?? product.shades?.find((s) => s.inStock) ?? product.shades?.[0];
    const size = selectedSize ?? product.sizes?.[0];
    const sameProductQty = cartLines.filter((l) => l.productId === product.id).reduce((s, l) => s + l.quantity, 0);
    const allowed = Math.min(MAX_LINE_QTY, available) - sameProductQty;
    if (allowed <= 0) { addToast('Maximum quantity reached', `Only ${available} available for ${product.name}.`, 'info'); return; }
    const qty = Math.min(quantity, allowed);
    setCartLines((lines) => {
      const idx = lines.findIndex((l) => l.productId === product.id && l.shadeId === shade?.id && l.size === size);
      if (idx > -1) return lines.map((l, i) => (i === idx ? { ...l, quantity: l.quantity + qty } : l));
      return [{ id: `cart-${uid()}`, productId: product.id, shadeId: shade?.id, size, quantity: qty }, ...lines];
    });
    addToast('Added to Shopping Bag', `${product.name} (${qty}x)`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCartLines((l) => l.filter((x) => x.id !== id));
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    const line = cartLines.find((l) => l.id === id);
    const product = products.find((p) => p.id === line?.productId);
    const max = Math.min(MAX_LINE_QTY, product?.stockLeft ?? MAX_LINE_QTY);
    if (quantity > max) addToast('Limited availability', `Only ${max} available.`, 'info');
    setCartLines((lines) => lines.map((l) => (l.id === id ? { ...l, quantity: Math.min(quantity, max) } : l)));
  };
  const clearCart = () => { setCartLines([]); setSelectedSamples([]); setAppliedPromo(null); };

  const promoRule: PromoRule | null = appliedPromo
    ? {
        code: appliedPromo.code,
        discountPercent: appliedPromo.discountPercent,
        discountAmountCents: appliedPromo.discountAmount ? toCents(appliedPromo.discountAmount) : undefined,
        freeShipping: appliedPromo.freeShipping,
        minSpendCents: appliedPromo.minSpend ? toCents(appliedPromo.minSpend) : 0
      }
    : null;

  const computeCartPricing: AppContextType['computeCartPricing'] = (shippingMethod = 'Standard', gift) =>
    computePricing({
      lines: cart.map((i) => ({ unitPriceCents: toCents(i.product.price), quantity: i.quantity })),
      promo: promoRule,
      shippingMethod,
      isGift: gift?.isGift,
      giftWrapType: gift?.giftWrapType,
      tier: user?.tier,
      rules: pricingRules
    });

  const applyPromo = async (rawCode: string) => {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    try {
      const { promo } = await api<{ promo: PromoCode }>('/promos/validate', { body: { code: rawCode, subtotal } });
      setAppliedPromo(promo);
      addToast('VIP Promo Activated', promo.description, 'luxury');
      return { success: true, message: `Promo code ${promo.code} applied successfully!` };
    } catch (err) {
      return { success: false, message: errorMessage(err) };
    }
  };
  const removePromo = () => setAppliedPromo(null);

  const toggleSample = (sample: FreeSample) => {
    const merch = cart.reduce((n, i) => n + toCents(i.product.price) * i.quantity, 0);
    if (!selectedSamples.some((x) => x.id === sample.id) && merch < SAMPLE_MIN_SPEND_CENTS) {
      addToast('Samples unlock at $50', 'Add a little more to your bag to choose complimentary samples.', 'info');
      return;
    }
    if (selectedSamples.some((s) => s.id === sample.id)) {
      setSelectedSamples((prev) => prev.filter((s) => s.id !== sample.id));
      return;
    }
    setSelectedSamples((prev) => (prev.length >= 2 ? [prev[1], sample] : [...prev, sample]));
    addToast('Deluxe Miniature Selected', sample.name, 'luxury');
  };

  const createOrder: AppContextType['createOrder'] = async (shippingAddress, shippingMethod, orderGift) => {
    const gift = orderGift ?? giftOption;
    try {
      const { order } = await api<{ order: Order }>('/orders', {
        headers: { 'Idempotency-Key': checkoutKey.current },
        body: {
          items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity, shadeId: i.selectedShade?.id, size: i.selectedSize })),
          sampleIds: cart.reduce((n, i) => n + toCents(i.product.price) * i.quantity, 0) >= SAMPLE_MIN_SPEND_CENTS ? selectedSamples.map((s) => s.id) : [],
          shippingAddress: { ...shippingAddress, apt: shippingAddress.apt || undefined },
          shippingMethod,
          giftOption: gift.isGift ? { isGift: true, giftWrapType: gift.giftWrapType, cardMessage: gift.cardMessage || undefined } : { isGift: false },
          promoCode: appliedPromo?.code
        }
      });
      checkoutKey.current = uid();
      clearCart();
      setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
      reloadProducts();          // stock changed
      refreshUser().catch(() => undefined); // points / tier changed
      return order;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { setUser(null); setIsCheckoutOpen(false); setAuthMode('signin'); setIsAuthModalOpen(true); }
      if (err instanceof ApiError && err.status === 409) reloadProducts();
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { order } = await api<{ order: Order }>(`/orders/${orderId}/cancel`, { method: 'POST', body: {} });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      addToast('Order Cancelled', `${order.orderNumber} was cancelled.`, 'info');
      reloadProducts(); refreshUser().catch(() => undefined);
      return true;
    } catch (err) { fail(err, 'Could not cancel order'); return false; }
  };

  // ---------------------------------------------------------- wishlist ----
  const isInWishlist = (id: string) => wishlist.includes(id);
  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    const prod = products.find((p) => p.id === productId);
    setWishlist((prev) => (exists ? prev.filter((x) => x !== productId) : [...prev, productId]));
    addToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist', prod?.name, exists ? 'info' : 'luxury');
    if (user) {
      api(`/me/wishlist/${encodeURIComponent(productId)}`, { method: exists ? 'DELETE' : 'PUT' }).catch((err) => {
        setWishlist((prev) => (exists ? [...prev, productId] : prev.filter((x) => x !== productId)));
        fail(err, 'Wishlist not saved');
      });
    }
  };
  const moveAllWishlistToBag = () => {
    wishlist.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) addToCart(prod, prod.shades?.find((s) => s.inStock), prod.sizes?.[0], 1);
    });
    if (user) wishlist.forEach((id) => api(`/me/wishlist/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => undefined));
    setWishlist([]);
    setIsWishlistOpen(false);
  };

  // ----------------------------------------------------------- compare ----
  const toggleCompare = (product: Product) => {
    if (comparedProducts.some((p) => p.id === product.id)) {
      setComparedProducts((prev) => prev.filter((p) => p.id !== product.id));
      addToast('Removed from Comparison', product.name);
      return;
    }
    if (comparedProducts.length >= 4) { addToast('Comparison Full', 'You can compare up to 4 items simultaneously.', 'info'); return; }
    setComparedProducts((prev) => [...prev, product]);
    addToast('Added to Formula Comparison', product.name, 'luxury');
    setIsCompareOpen(true);
  };
  const clearCompare = () => setComparedProducts([]);

  const openVTO = (product?: Product, shade?: Shade) => {
    const target = product ?? products.find((p) => p.shades?.length) ?? products[0];
    if (!target) return;
    setVtoProduct(target);
    setVtoShade(shade ?? target.shades?.[0] ?? null);
    setIsVTOOpen(true);
  };
  const closeVTO = () => setIsVTOOpen(false);
  const openIngredientModal = (product: Product) => { setIngredientProduct(product); setIsIngredientModalOpen(true); };
  const closeIngredientModal = () => setIsIngredientModalOpen(false);

  // ----------------------------------------------------------- filters ----
  const filteredProducts = products
    .filter((product) => {
      if (filters.category !== 'All' && product.category !== filters.category) return false;
      if (filters.subcategory && product.subcategory !== filters.subcategory) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
      if (filters.skinType && filters.skinType !== 'All' && product.skinTypes) {
        if (!product.skinTypes.includes(filters.skinType) && !product.skinTypes.includes('All')) return false;
      }
      if (filters.cleanOnly && !product.isClean) return false;
      if (filters.saleOnly && !product.isSale) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        if (![product.name, product.brand, product.category, product.subcategory].some((f) => f.toLowerCase().includes(q))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'bestselling': return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default: return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      }
    });

  const setCategory = (category: Category) => setFilters((prev) => ({ ...prev, category, subcategory: undefined }));
  const setSearchQuery = (query: string) => setFilters((prev) => ({ ...prev, searchQuery: query }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // ------------------------------------------------------------ admin ----
  const isStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const isAdmin = user?.role === 'Admin';
  const [isAdminOpen, setIsAdminOpenRaw] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [analytics, setAnalytics] = useState<SalesAnalytics>(EMPTY_ANALYTICS);

  // ------------------------------------------------------------ reviews ----
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [reviewsLoading, setReviewsLoading] = useState<Record<string, boolean>>({});

  const loadReviews = useCallback(async (productId: string) => {
    setReviewsLoading((p) => ({ ...p, [productId]: true }));
    try {
      const { reviews: list } = await api<{ reviews: Review[] }>(`/products/${encodeURIComponent(productId)}/reviews`);
      setReviews((p) => ({ ...p, [productId]: list }));
    } catch { /* leave empty; section shows its empty state */ }
    finally { setReviewsLoading((p) => ({ ...p, [productId]: false })); }
  }, []);
  const getProductReviews = (productId: string) => reviews[productId] ?? [];

  const requireSignIn = (message: string): boolean => {
    if (user) return true;
    addToast('Sign in required', message, 'info');
    setAuthMode('signin');
    setIsAuthModalOpen(true);
    return false;
  };

  const addReview: AppContextType['addReview'] = async (productId, data) => {
    if (!requireSignIn('Please sign in to share a review.')) return;
    try {
      const { review } = await api<{ review: Review }>(`/products/${encodeURIComponent(productId)}/reviews`, { body: data });
      setReviews((p) => ({ ...p, [productId]: [review, ...(p[productId] ?? [])] }));
      reloadProducts();
      addToast('Review Published ✓', review.verifiedPurchase ? 'Thank you — your verified review is live.' : 'Thank you — your review is live.', 'luxury');
    } catch (err) { fail(err, 'Review not published'); throw err; }
  };

  const voteReview: AppContextType['voteReview'] = async (productId, reviewId, type) => {
    if (!requireSignIn('Please sign in to vote on reviews.')) return;
    const current = (reviews[productId] ?? []).find((r) => r.id === reviewId);
    const already = type === 'helpful' ? current?.userVotedHelpful : current?.userVotedUnhelpful;
    try {
      const { review } = await api<{ review: Review }>(`/reviews/${reviewId}/vote`, { body: { vote: already ? 'none' : type } });
      setReviews((p) => ({ ...p, [productId]: (p[productId] ?? []).map((r) => (r.id === reviewId ? review : r)) }));
    } catch (err) { fail(err, 'Vote not recorded'); }
  };

  const deleteReview: AppContextType['deleteReview'] = async (productId, reviewId) => {
    try {
      await api(`/reviews/${reviewId}`, { method: 'DELETE' });
      setReviews((p) => ({ ...p, [productId]: (p[productId] ?? []).filter((r) => r.id !== reviewId) }));
      setAdminReviews((p) => p.filter((r) => r.id !== reviewId));
      reloadProducts();
      addToast('Review Removed', 'The review was removed.', 'info');
    } catch (err) { fail(err, 'Could not remove review'); }
  };

  // ------------------------------------------------------- auth actions ----
  const login = async (email: string, password: string) => {
    const { user: u } = await api<{ user: User }>('/auth/login', { body: { email, password } });
    await hydrateAccount(u);
    setIsAuthModalOpen(false);
    addToast('Welcome Back', `Signed in as ${u.name.split(' ')[0]}`, 'luxury');
  };
  const register = async (name: string, email: string, password: string) => {
    const { user: u } = await api<{ user: User }>('/auth/register', { body: { name, email, password } });
    await hydrateAccount(u);
    setIsAuthModalOpen(false);
    addToast('Welcome to Sayphora', 'Account created! 50 Welcome points awarded.', 'success');
  };
  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST', body: {} }); } catch { /* cookie may already be gone */ }
    setUser(null); setOrders([]); setWishlist(readStorage<string[]>('sayphora_wishlist', []));
    setIsAdminOpenRaw(false); setAdminOrders([]); setAdminProducts([]); setPromos([]); setAdminReviews([]);
    setRewards([]); setRedemptions([]);
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };
  const forgotPassword = async (email: string) => (await api<{ message: string }>('/auth/forgot-password', { body: { email } })).message;
  const resetPassword = async (token: string, password: string) => {
    await api('/auth/reset-password', { body: { token, password } });
    setUser(null);
    setResetToken(null);
    addToast('Password updated', 'Sign in with your new password.', 'success');
  };

  const updateBeautyProfile: AppContextType['updateBeautyProfile'] = async (profile) => {
    if (!user) return;
    try {
      const { user: u } = await api<{ user: User }>('/me', { method: 'PATCH', body: { beautyProfile: profile } });
      setUser(u);
      addToast('Beauty Profile Updated', 'Recommendations recalibrated', 'luxury');
    } catch (err) { fail(err, 'Profile not saved'); }
  };

  const saveAddress = async (a: Address) => {
    try {
      await api('/me/addresses', { body: a });
      await refreshUser();
      addToast('Address saved', undefined, 'success');
    } catch (err) { fail(err, 'Address not saved'); }
  };
  const deleteAddress = async (id: string) => {
    try { await api(`/me/addresses/${id}`, { method: 'DELETE' }); await refreshUser(); } catch (err) { fail(err, 'Address not removed'); }
  };

  const loadRewards = useCallback(async () => {
    try {
      const r = await api<{ rewards: Reward[]; redemptions: RewardRedemption[] }>('/me/rewards');
      setRewards(r.rewards); setRedemptions(r.redemptions);
    } catch { /* not signed in */ }
  }, []);

  const redeemReward: AppContextType['redeemReward'] = async (rewardId) => {
    if (!requireSignIn('Sign in to redeem rewards.')) return null;
    try {
      const r = await api<{ code: string; title: string; value: number }>(`/me/rewards/${rewardId}/redeem`, { method: 'POST', body: {} });
      await Promise.all([refreshUser(), loadRewards()]);
      addToast('Reward Redeemed', `Your code ${r.code} is ready to use at checkout.`, 'luxury');
      return r;
    } catch (err) { fail(err, 'Could not redeem'); return null; }
  };

  // ------------------------------------------------------------- admin ----
  const refreshAdmin = useCallback(async () => {
    if (!isStaff) return;
    setAdminLoading(true);
    try {
      const [p, o, r, a, pr] = await Promise.all([
        api<{ products: Product[] }>('/admin/products'),
        api<{ orders: Order[] }>('/admin/orders'),
        api<{ reviews: AdminReview[] }>('/admin/reviews'),
        api<SalesAnalytics>('/admin/analytics'),
        isAdmin ? api<{ promos: PromoCode[] }>('/admin/promos') : Promise.resolve({ promos: [] as PromoCode[] })
      ]);
      setAdminProducts(p.products); setAdminOrders(o.orders); setAdminReviews(r.reviews); setAnalytics(a); setPromos(pr.promos);
    } catch (err) { fail(err, 'Could not load admin data'); }
    finally { setAdminLoading(false); }
  }, [isStaff, isAdmin, fail]);

  const setIsAdminOpen = (open: boolean) => {
    if (open && !isStaff) { addToast('Staff access only', 'Sign in with a staff account to open the operations console.', 'info'); setAuthMode('signin'); setIsAuthModalOpen(true); return; }
    setIsAdminOpenRaw(open);
    if (open) refreshAdmin();
  };

  const afterCatalogChange = async () => { await Promise.all([refreshAdmin(), reloadProducts()]); };

  const addProduct: AppContextType['addProduct'] = async (data) => {
    try {
      const { product } = await api<{ product: Product }>('/admin/products', { body: data });
      await afterCatalogChange();
      addToast('Product Published', `${product.name} added to the catalogue.`, 'success');
      return product;
    } catch (err) { fail(err, 'Product not created'); return null; }
  };
  const updateProduct: AppContextType['updateProduct'] = async (id, updates) => {
    try {
      await api(`/admin/products/${id}`, { method: 'PUT', body: updates });
      await afterCatalogChange();
      addToast('Catalogue Updated', 'Product changes saved.', 'success');
      return true;
    } catch (err) { fail(err, 'Product not saved'); return false; }
  };
  const deleteProduct = async (id: string) => {
    try {
      await api(`/admin/products/${id}`, { method: 'DELETE' });
      await afterCatalogChange();
      addToast('Product Archived', 'Removed from the storefront; order history is preserved.', 'warning');
    } catch (err) { fail(err, 'Could not archive product'); }
  };
  const updateStock = async (id: string, newStock: number) => {
    try {
      await api(`/admin/products/${id}/stock`, { method: 'PATCH', body: { stock: newStock } });
      await afterCatalogChange();
      addToast('Inventory Updated', `Stock set to ${newStock} units.`, 'info');
    } catch (err) { fail(err, 'Stock not updated'); }
  };

  const patchOrder = async (orderId: string, body: Record<string, unknown>, okTitle: string, okDesc?: string) => {
    try {
      const { order, refundRequired } = await api<{ order: Order; refundRequired?: boolean }>(`/admin/orders/${orderId}`, { method: 'PATCH', body });
      setAdminOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      addToast(okTitle, okDesc ?? order.orderNumber, 'luxury');
      if (refundRequired) addToast('Refund required', 'This order was already paid — issue the refund in your payment system.', 'warning');
      if (body.status === 'Cancelled') reloadProducts();
      api<SalesAnalytics>('/admin/analytics').then(setAnalytics).catch(() => undefined);
      return true;
    } catch (err) { fail(err, 'Order not updated'); return false; }
  };
  const updateOrderStatus: AppContextType['updateOrderStatus'] = (orderId, status, extra) =>
    patchOrder(orderId, { status, ...extra }, 'Order Status Updated', `Marked as ${status}`);
  const updateOrderTracking: AppContextType['updateOrderTracking'] = (orderId, trackingNumber, carrier) =>
    patchOrder(orderId, { trackingNumber, ...(carrier ? { carrier } : {}) }, 'Tracking Updated', trackingNumber);
  const markOrderPaid = async (orderId: string) => { await patchOrder(orderId, { paymentStatus: 'Paid' }, 'Payment recorded'); };

  const createPromo = async (promo: PromoCode) => {
    try {
      await api('/admin/promos', { body: promo });
      await refreshAdmin();
      addToast('Promotion Created', `Promo code ${promo.code} is now live.`, 'success');
      return true;
    } catch (err) { fail(err, 'Promotion not created'); return false; }
  };
  const togglePromoActive = async (code: string, isActive: boolean) => {
    try { await api(`/admin/promos/${code}`, { method: 'PATCH', body: { isActive } }); await refreshAdmin(); } catch (err) { fail(err); }
  };
  const deletePromo = async (code: string) => {
    try { await api(`/admin/promos/${code}`, { method: 'DELETE' }); await refreshAdmin(); addToast('Promotion Removed', code, 'info'); } catch (err) { fail(err); }
  };

  // ------------------------------------------------------ misc actions ----
  const openAIStudio = (tab: AiTab = 'shade') => { setAiStudioTab(tab); setIsAIStudioOpen(true); };
  const closeAIStudio = () => setIsAIStudioOpen(false);
  const openOrderTracking = (orderNumber?: string) => {
    if (!user) { addToast('Sign in to track orders', 'Your orders are available once you are signed in.', 'info'); setAuthMode('signin'); setIsAuthModalOpen(true); return; }
    setTrackedOrderNumber(orderNumber ?? orders[0]?.orderNumber ?? '');
    setIsOrderTrackingOpen(true);
    refreshOrders();
  };
  const closeOrderTracking = () => setIsOrderTrackingOpen(false);

  const value: AppContextType = {
    products, filteredProducts, productsLoading, productsError, reloadProducts, samples, cart, wishlist, appliedPromo, selectedSamples,
    user, authLoading, orders, filters, pricingRules, paymentProvider, computeCartPricing,
    currency, setCurrency, formatPrice,
    quickViewProduct, isCartOpen, isWishlistOpen, isCheckoutOpen, isAuthModalOpen, authMode, resetToken, isBeautyInsiderOpen,
    isAIStudioOpen, aiStudioTab, isOrderTrackingOpen, trackedOrderNumber,
    isVTOOpen, vtoProduct, vtoShade, openVTO, closeVTO,
    comparedProducts, isCompareOpen, setIsCompareOpen, toggleCompare, clearCompare,
    isIngredientModalOpen, ingredientProduct, openIngredientModal, closeIngredientModal,
    toasts, addToast, removeToast, giftOption, setGiftOption, viewMode, setViewMode,
    isStaff, isAdmin, isAdminOpen, setIsAdminOpen, adminLoading, refreshAdmin, adminProducts, adminOrders, adminReviews,
    addProduct, updateProduct, deleteProduct, updateStock, updateOrderStatus, updateOrderTracking, markOrderPaid,
    promos, createPromo, togglePromoActive, deletePromo, analytics,
    setQuickViewProduct, setIsCartOpen, setIsWishlistOpen, setIsCheckoutOpen, setIsAuthModalOpen, setAuthMode, setIsBeautyInsiderOpen,
    openAIStudio, closeAIStudio, setAiStudioTab, openOrderTracking, closeOrderTracking,
    isStoreLocatorOpen, setIsStoreLocatorOpen, storeLocatorQuery, storeLocatorBrand, selectedBoutique, setSelectedBoutique, openStoreLocator, closeStoreLocator,
    reviews, reviewsLoading, loadReviews, getProductReviews, addReview, voteReview, deleteReview,
    addToCart, removeFromCart, updateQuantity, clearCart, applyPromo, removePromo, toggleSample, createOrder, cancelOrder, refreshOrders,
    toggleWishlist, isInWishlist, moveAllWishlistToBag, setCategory, setSearchQuery, setFilters, resetFilters,
    login, register, logout, forgotPassword, resetPassword, updateBeautyProfile, saveAddress, deleteAddress, rewards, redemptions, loadRewards, redeemReward
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
