export type Category = 
  | 'All'
  | 'Makeup'
  | 'Skincare'
  | 'Fragrance'
  | 'Haircare'
  | 'Bath & Body'
  | 'Tools & Brushes'
  | 'Clean Beauty';

export type SkinType = 'All' | 'Dry' | 'Oily' | 'Combination' | 'Normal' | 'Sensitive';
export type SkinTone = 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep' | 'Rich';
export type Undertone = 'Cool' | 'Warm' | 'Neutral' | 'Olive';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface Shade {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  description?: string;
  finishType?: 'Matte' | 'Dewy' | 'Glossy' | 'Satin' | 'Radiant';
}

export interface IngredientAnalysis {
  actives: Array<{ name: string; purpose: string; safetyScore: number }>;
  allergensFree: string[];
  cleanStandard: 'Clean at Sayphora' | 'Clinical' | 'Organic Certified';
  phLevel?: number;
  comedogenicRating: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userBadge?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  shadeUsed?: string;
  skinType?: string;
  skinTone?: string;
  undertone?: string;
  recommended?: boolean;
  helpfulCount: number;
  unhelpfulCount?: number;
  userVotedHelpful?: boolean;
  userVotedUnhelpful?: boolean;
  photos?: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  subcategory: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  isClean?: boolean;
  isSale?: boolean;
  stockLeft?: number;
  status?: 'Active' | 'Draft' | 'Archived';
  description: string;
  details: string[];
  howToUse: string[];
  ingredients: string;
  ingredientAnalysis?: IngredientAnalysis;
  image: string;
  hoverImage: string;
  shades?: Shade[];
  sizes?: string[];
  skinTypes?: SkinType[];
  coverage?: 'Sheer' | 'Medium' | 'Full' | 'Buildable';
  finish?: 'Matte' | 'Dewy' | 'Radiant' | 'Natural' | 'Satin';
  awards?: string;
  frequentlyBoughtWith?: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  selectedShade?: Shade;
  selectedSize?: string;
  quantity: number;
}

export interface PromoCode {
  requiredTier?: string;
  maxUses?: number;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  freeShipping?: boolean;
  description: string;
  minSpend?: number;
  usageCount?: number;
  isActive?: boolean;
  expiresAt?: string;
}

export interface FreeSample {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
}

export interface Address {
  fullName: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export type OrderStatus = 'Processing' | 'Packed' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface GiftOption {
  isGift: boolean;
  giftWrapType: 'Signature Black & Gold Box' | 'Eco Velvet Pouch';
  recipientName?: string;
  cardMessage?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  shadeId?: string;
  shadeName?: string;
  shadeHex?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEvent {
  status: string;
  note?: string;
  at: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  createdAt: string;
  customerEmail?: string;
  items: OrderItem[];
  samples: FreeSample[];
  subtotal: number;
  discount: number;
  giftFee: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  promoCode?: string;
  shippingAddress: Address;
  shippingMethod: 'Standard' | 'Express' | 'Next-Day';
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  giftOption?: GiftOption;
  status: OrderStatus;
  carrier?: string;
  trackingNumber: string;
  estimatedDelivery: string;
  pointsEarned: number;
  events: OrderEvent[];
}

export interface UserBeautyProfile {
  skinType: SkinType;
  skinTone: SkinTone;
  undertone: Undertone;
  concerns: string[];
  favoriteBrands: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'Customer' | 'Admin' | 'Staff';
  tier: 'Insider' | 'VIB' | 'Rouge';
  points: number;
  pointsToNextTier: number;
  beautyProfile: UserBeautyProfile;
  phone?: string;
  savedAddresses: Array<Address & { id?: string }>;
}

export interface FilterState {
  category: Category;
  subcategory?: string;
  brand?: string;
  minPrice: number;
  maxPrice: number;
  skinType?: SkinType;
  cleanOnly: boolean;
  saleOnly: boolean;
  sortBy: 'featured' | 'bestselling' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'luxury' | 'warning';
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
  totalCustomers: number;
  newCustomers30d: number;
  returnRate: number;
  sampleAttachRate: number;
  categoryBreakdown: Record<string, number>;
  revenueByDay: Array<{ day: string; revenue: number }>;
  ordersByStatus: Record<string, number>;
  lowStockCount: number;
  outOfStockCount: number;
  ai: {
    byKind: Record<string, { gemini: number; fallback: number }>;
    undertones: Array<{ undertone: string; count: number }>;
    geminiConfigured: boolean;
  };
  boutiques: { count: number; cities: number };
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  value: number;
}

export interface RewardRedemption {
  id: string;
  code: string;
  title: string;
  pointsSpent: number;
  createdAt: string;
  used: boolean;
  expiresAt?: string;
}

export interface GroundingReviewSnippet {
  uri?: string;
  snippet?: string;
  author?: string;
}

export interface BoutiquePlace {
  id: string;
  name: string;
  address?: string;
  uri: string; // Direct Google Maps URI
  rating?: number;
  reviewsCount?: number;
  phone?: string;
  openNow?: boolean;
  distance?: string;
  services?: string[];
  snippets?: string[];
  source?: 'maps_grounding' | 'verified_atelier';
  reviewSources?: GroundingReviewSnippet[];
  inStockItems?: string[];
}

export interface StoreLocatorResponse {
  summary: string;
  places: BoutiquePlace[];
  groundingChunks?: any[];
  searchQueries?: string[];
  userLocationName?: string;
  source: 'google_maps_grounding' | 'verified_catalog';
}

