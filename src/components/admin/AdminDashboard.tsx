import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Tag, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Search, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronDown,
  Filter,
  MapPin,
  ExternalLink,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Star,
  MessageSquare,
  Eye,
  CheckCircle2,
  Copy,
  Printer,
  SlidersHorizontal,
  ThumbsUp,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Order, PromoCode, OrderStatus, Category } from '../../types';
import { canTransition } from '../../../shared/commerce';
import { clearAllCaches } from '../../registerServiceWorker';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    adminProducts: products,
    isAdmin,
    adminLoading,
    refreshAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    adminOrders: orders,
    updateOrderStatus,
    updateOrderTracking,
    promos,
    createPromo,
    togglePromoActive,
    deletePromo,
    analytics,
    formatPrice,
    openStoreLocator,
    adminReviews,
    deleteReview,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'reviews' | 'promos' | 'ai'>('overview');
  
  // Product Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('All');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Order Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Selected Order for Packing Slip / Modal
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Category>('Makeup');
  const [newProdSubcategory, setNewProdSubcategory] = useState('Lipstick');
  const [newProdPrice, setNewProdPrice] = useState(38.00);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80');
  const [newProdDescription, setNewProdDescription] = useState('Ultra-luxurious, velvet hydrating formula crafted for all-day skin comfort.');
  const [newProdIsClean, setNewProdIsClean] = useState(true);
  const [newProdIsBestseller, setNewProdIsBestseller] = useState(false);

  // New Promo Modal State
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(20);
  const [newPromoType, setNewPromoType] = useState<'percent' | 'amount' | 'shipping'>('percent');
  const [newPromoDesc, setNewPromoDesc] = useState('VIP Seasonal Exclusive Privilege');

  if (!isAdminOpen) return null;

  const allReviewsList = adminReviews;

  // Filtered Products
  const filteredAdminProducts = products.filter(p => {
    const matchCat = productCatFilter === 'All' || p.category === productCatFilter;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                        p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const stock = p.stockLeft ?? 20;
    const matchStock = productStockFilter === 'all' 
      ? true 
      : productStockFilter === 'low' 
      ? stock <= 5 && stock > 0
      : stock === 0;
    return matchCat && matchSearch && matchStock;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.shippingAddress.city.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const lowStockCount = products.filter(p => (p.stockLeft ?? 20) <= 5).length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addProduct({
      name: newProdName.trim(),
      brand: newProdBrand.trim(),
      category: newProdCategory,
      subcategory: newProdSubcategory.trim() || 'General',
      price: Number(newProdPrice),
      stockLeft: Number(newProdStock),
      image: newProdImage.trim(),
      hoverImage: newProdImage.trim(),
      description: newProdDescription.trim(),
      details: [],
      howToUse: [],
      ingredients: '',
      isClean: newProdIsClean,
      isBestseller: newProdIsBestseller
    } as Parameters<typeof addProduct>[0]);
    if (created) {
      setIsAddProductOpen(false);
      setNewProdName('');
      setNewProdBrand('');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const ok = await createPromo({
      code: newPromoCode.trim().toUpperCase(),
      discountPercent: newPromoType === 'percent' ? Number(newPromoDiscount) : undefined,
      discountAmount: newPromoType === 'amount' ? Number(newPromoDiscount) : undefined,
      freeShipping: newPromoType === 'shipping',
      description: newPromoDesc.trim()
    });
    if (ok) {
      setIsAddPromoOpen(false);
      setNewPromoCode('');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    addToast('Copied to Clipboard', `${label}: ${text}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[94vh] bg-stone-950 text-stone-100 rounded-3xl shadow-2xl overflow-hidden border border-stone-800 flex flex-col md:flex-row">
        
        {/* ================= LEFT EXECUTIVE SIDEBAR ================= */}
        <aside className="w-full md:w-64 lg:w-72 bg-stone-900/90 border-b md:border-b-0 md:border-r border-stone-800 flex flex-col shrink-0">
          {/* Brand Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                  Sayphora Operations
                </span>
                <span className="font-serif text-sm font-bold text-white tracking-tight">
                  Executive Suite
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="md:hidden p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              aria-label="Close admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Executive Overview</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'overview' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 shrink-0" />
                <span>Product Catalog</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'products' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Orders & Fulfillment</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-stone-950/20 text-stone-950' : 'bg-amber-400/20 text-amber-300'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Customer Reviews</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'reviews' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                {allReviewsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'promos'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 shrink-0" />
                <span>VIP Promos & Codes</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'promos' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                {promos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                <span>AI Diagnostics & Maps</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'ai' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-emerald-400'
              }`}>
                3.8 Flash
              </span>
            </button>
          </nav>

          {/* Sidebar Status Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/50 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cluster Online</span>
              </span>
              <span className="font-mono text-stone-500">v1.2.0</span>
            </div>

            {lowStockCount > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-800/60 flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px]">{lowStockCount} items low in stock</span>
              </div>
            )}

            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-stone-950 overflow-hidden">
          
          {/* Topbar Actions */}
          <header className="p-4 sm:p-5 border-b border-stone-800/90 bg-stone-900/60 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                {activeTab === 'overview' && 'Executive Performance & Intelligence'}
                {activeTab === 'products' && 'Prestige Inventory & Stock Architecture'}
                {activeTab === 'orders' && 'Client Dispatch & Parcel Logistics'}
                {activeTab === 'reviews' && 'Customer Reviews & Quality Moderation'}
                {activeTab === 'promos' && 'Promotions & VIP Privilege Campaigns'}
                {activeTab === 'ai' && 'Gemini 3.8 Flash Diagnostics & Store Locator'}
              </h2>
              <p className="text-xs text-stone-400">
                Sayphora Global Luxury Operations Platform
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === 'products' && (
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </button>
              )}

              {activeTab === 'promos' && (
                <button
                  onClick={() => setIsAddPromoOpen(true)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Promo</span>
                </button>
              )}

              <button
                onClick={() => setIsAdminOpen(false)}
                className="hidden md:flex p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
                aria-label="Close admin"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

            {/* ================= TAB 1: OVERVIEW ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Gross Revenue (GMV)</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white tracking-tight">
                      {formatPrice(analytics.totalRevenue)}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Last 14 days: {formatPrice(analytics.revenueByDay.reduce((n, d) => n + d.revenue, 0))}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Orders Placed</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white tracking-tight">
                      {analytics.totalOrders.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-stone-400 font-medium">
                      {analytics.ordersByStatus.Processing ?? 0} awaiting fulfilment
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Average Order Value</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white tracking-tight">
                      {formatPrice(analytics.averageOrderValue)}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      Excludes cancelled orders
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Active Customers (90 days)</span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-serif font-bold text-white tracking-tight">
                      {analytics.activeCustomers.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-amber-300 font-medium">
                      {analytics.totalCustomers} registered · {analytics.newCustomers30d} new in 30 days
                    </div>
                  </div>
                </div>

                {/* Category Breakdown & Operations Health */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Revenue Breakdown */}
                  <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold text-white">
                        Department Revenue Distribution
                      </h3>
                      <span className="text-xs text-stone-400">Current Quarter</span>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      {Object.entries(analytics.categoryBreakdown).map(([cat, percent]) => (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-stone-300 font-medium">{cat}</span>
                            <span className="font-bold text-amber-300">{percent}%</span>
                          </div>
                          <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-linear-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fulfilment Diagnostics */}
                  <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                    <h3 className="font-serif text-base font-bold text-white">
                      Fulfilment & Inventory Diagnostics
                    </h3>

                    <div className="grid grid-cols-2 gap-3.5 pt-1 text-xs">
                      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                        <span className="text-stone-400 text-xs">Cancellation Rate</span>
                        <div className="text-2xl font-bold text-emerald-400">{analytics.returnRate}%</div>
                        <span className="text-[11px] text-stone-500">Of all orders placed</span>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                        <span className="text-stone-400 text-xs">Low-Stock Products</span>
                        <div className={`text-2xl font-bold ${analytics.lowStockCount > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>{analytics.lowStockCount}</div>
                        <span className="text-[11px] text-stone-500">5 units or fewer · {analytics.outOfStockCount} sold out</span>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                        <span className="text-stone-400 text-xs">Sample Attachment</span>
                        <div className="text-2xl font-bold text-amber-300">{analytics.sampleAttachRate}%</div>
                        <span className="text-[11px] text-stone-500">Orders with complimentary samples</span>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                        <span className="text-stone-400 text-xs">Orders In Progress</span>
                        <div className="text-2xl font-bold text-amber-300">
                          {(['Processing', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery'] as const).reduce((n, k) => n + (analytics.ordersByStatus[k] ?? 0), 0)}
                        </div>
                        <span className="text-[11px] text-stone-500">Not yet delivered</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-white">Recent Client Orders</h3>
                      <p className="text-xs text-stone-400">Live order activity ready for dispatch fulfillment</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="divide-y divide-stone-800/80">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-white bg-stone-800 px-2 py-1 rounded">
                            {order.orderNumber}
                          </span>
                          <div>
                            <div className="font-semibold text-stone-200">{order.shippingAddress.fullName}</div>
                            <div className="text-[11px] text-stone-500">{order.date} · {order.items.length} items</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-300">{formatPrice(order.total)}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: PRODUCTS ================= */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search title, brand..."
                        className="w-full text-xs pl-8 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="text-xs px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="All">All Categories</option>
                      <option value="Makeup">Makeup</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Fragrance">Fragrance</option>
                      <option value="Haircare">Haircare</option>
                      <option value="Bath & Body">Bath & Body</option>
                    </select>

                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                      <button
                        onClick={() => setProductStockFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          productStockFilter === 'all' ? 'bg-stone-800 text-white font-bold' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        All Stock
                      </button>
                      <button
                        onClick={() => setProductStockFilter('low')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          productStockFilter === 'low' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Low (≤5)
                      </button>
                      <button
                        onClick={() => setProductStockFilter('out')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          productStockFilter === 'out' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Out of Stock
                      </button>
                    </div>
                  </div>

                  <span className="text-xs text-stone-400">
                    Showing <strong>{filteredAdminProducts.length}</strong> of {products.length} products
                  </span>
                </div>

                {/* Products Data Table */}
                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                        <tr>
                          <th className="py-3.5 px-4">Item & Formula</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Retail Price</th>
                          <th className="py-3.5 px-4">Stock In Atelier</th>
                          <th className="py-3.5 px-4">Rating</th>
                          <th className="py-3.5 px-4">Attributes</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60 text-stone-300">
                        {filteredAdminProducts.map(prod => {
                          const stock = prod.stockLeft ?? 20;
                          return (
                            <tr key={prod.id} className="hover:bg-stone-900/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={prod.image} 
                                    alt={prod.name} 
                                    className="w-12 h-12 object-cover rounded-xl border border-stone-800 shrink-0" 
                                  />
                                  <div className="min-w-0 max-w-xs">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                                      {prod.brand}
                                    </span>
                                    <span className="font-semibold text-white truncate block">
                                      {prod.name}
                                    </span>
                                    <span className="text-[10px] text-stone-500 block truncate">
                                      ID: {prod.id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-stone-400">
                                <span className="font-medium text-stone-300">{prod.category}</span>
                                <span className="text-[11px] block text-stone-500">{prod.subcategory}</span>
                              </td>

                              <td className="py-3.5 px-4 font-bold text-white text-sm">
                                {formatPrice(prod.price)}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    defaultValue={stock}
                                    onBlur={(e) => updateStock(prod.id, Number(e.target.value))}
                                    className="w-16 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg px-2 py-1 text-center font-bold text-white text-xs outline-none"
                                  />
                                  {stock <= 5 && stock > 0 && (
                                    <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                                      Low
                                    </span>
                                  )}
                                  {stock === 0 && (
                                    <span className="text-[10px] text-rose-400 font-bold bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                                      Sold Out
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1 font-bold text-white">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span>{prod.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-[10px] text-stone-500">
                                  {prod.reviewCount} reviews
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {prod.isClean && (
                                    <span className="text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                                      Clean
                                    </span>
                                  )}
                                  {prod.isBestseller && (
                                    <span className="text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                                      Bestseller
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => deleteProduct(prod.id)}
                                  className="p-2 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors"
                                  title="Archive item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: ORDERS ================= */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search Order ID, Client, City..."
                        className="w-full text-xs pl-8 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="text-xs px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <span className="text-xs text-stone-400">
                    Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
                  </span>
                </div>

                {/* Orders Data Table */}
                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                        <tr>
                          <th className="py-3.5 px-4">Order ID & Date</th>
                          <th className="py-3.5 px-4">Client Recipient</th>
                          <th className="py-3.5 px-4">Articles & Total</th>
                          <th className="py-3.5 px-4">Tracking Code</th>
                          <th className="py-3.5 px-4">Fulfillment Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60 text-stone-300">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-stone-900/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-white block text-sm">
                                {order.orderNumber}
                              </span>
                              <span className="text-[11px] text-stone-500">{order.date}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-white block">{order.shippingAddress.fullName}</span>
                              <span className="text-[11px] text-stone-400 block truncate">
                                {order.shippingAddress.street}, {order.shippingAddress.city}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-amber-300 block text-sm">
                                {formatPrice(order.total)}
                              </span>
                              <span className="text-[11px] text-stone-400 block">
                                {order.items.length} items · {order.shippingMethod}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  defaultValue={order.trackingNumber}
                                  onBlur={(e) => { const v = e.target.value.trim(); if (v.length >= 3 && v !== order.trackingNumber) updateOrderTracking(order.id, v); }}
                                  placeholder="Add tracking #"
                                  className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs font-mono text-stone-200 w-36 focus:outline-none focus:border-amber-400"
                                />
                                {order.trackingNumber && (
                                  <button
                                    onClick={() => copyToClipboard(order.trackingNumber, 'Tracking #')}
                                    className="p-1 text-stone-400 hover:text-white"
                                    title="Copy tracking"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className={`rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none border ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : order.status === 'In Transit' || order.status === 'Shipped'
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : 'bg-stone-900 text-stone-200 border-stone-700'
                                }`}
                              >
                                <option value="Processing" disabled={order.status !== "Processing" && !canTransition(order.status as OrderStatus, "Processing" as OrderStatus)}>Processing</option>
                                <option value="Packed" disabled={order.status !== "Packed" && !canTransition(order.status as OrderStatus, "Packed" as OrderStatus)}>Packed</option>
                                <option value="Shipped" disabled={order.status !== "Shipped" && !canTransition(order.status as OrderStatus, "Shipped" as OrderStatus)}>Shipped</option>
                                <option value="In Transit" disabled={order.status !== "In Transit" && !canTransition(order.status as OrderStatus, "In Transit" as OrderStatus)}>In Transit</option>
                                <option value="Out for Delivery" disabled={order.status !== "Out for Delivery" && !canTransition(order.status as OrderStatus, "Out for Delivery" as OrderStatus)}>Out for Delivery</option>
                                <option value="Delivered" disabled={order.status !== "Delivered" && !canTransition(order.status as OrderStatus, "Delivered" as OrderStatus)}>Delivered</option>
                                <option value="Cancelled" disabled={order.status !== "Cancelled" && !canTransition(order.status as OrderStatus, "Cancelled" as OrderStatus)}>Cancelled</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setSelectedOrderForSlip(order)}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
                              >
                                View Slip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: REVIEWS MODERATION ================= */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">Client Review Moderation</h3>
                    <p className="text-xs text-stone-400">Audit user feedback, photo swatches, and verified buyer badges.</p>
                  </div>
                  <span className="text-xs text-amber-300 font-bold bg-amber-950/70 px-3 py-1 rounded-full border border-amber-800">
                    {allReviewsList.length} Total Verified Reviews
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allReviewsList.map(rev => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            {rev.productBrand} — {rev.productTitle}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-white text-sm">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Verified Buyer</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteReview(rev.productId, rev.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors"
                          title="Remove review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-stone-700 text-stone-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-stone-300 ml-2">{rev.title}</span>
                      </div>

                      <p className="text-xs text-stone-300 leading-relaxed font-sans">
                        {rev.comment}
                      </p>

                      {/* Photos if present */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.photos.map((pUrl, i) => (
                            <img
                              key={i}
                              src={pUrl}
                              alt="Review swatch"
                              className="w-14 h-14 object-cover rounded-xl border border-stone-800"
                            />
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                        <span>Posted on {rev.date}</span>
                        <div className="flex items-center gap-1 text-stone-400">
                          <ThumbsUp className="w-3 h-3 text-amber-400" />
                          <span>{rev.helpfulCount} helpful votes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 5: PROMOS ================= */}
            {activeTab === 'promos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">VIP Promotion Codes & Privileges</h3>
                    <p className="text-xs text-stone-400">Active campaigns, discount rates, and customer redemption tracking.</p>
                  </div>
                  <button
                    onClick={() => setIsAddPromoOpen(true)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Promo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promos.map(promo => (
                    <div key={promo.code} className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-lg font-bold text-amber-300 px-3 py-1 rounded-xl bg-stone-950 border border-amber-400/40">
                            {promo.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            promo.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-500'
                          }`}>
                            {promo.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>

                        <button
                          onClick={() => deletePromo(promo.code)}
                          className="text-stone-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-stone-300">{promo.description}</p>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-stone-800 text-stone-400">
                        <span>Total redemptions: <strong className="text-white">{promo.usageCount || 0}</strong></span>
                        <button
                          onClick={() => togglePromoActive(promo.code, !promo.isActive)}
                          className="text-xs text-amber-400 hover:underline font-semibold"
                        >
                          {promo.isActive ? 'Pause Code' : 'Activate Code'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 6: AI & DIAGNOSTICS ================= */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                {/* Gemini Model Intelligence */}
                <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-white">AI Assistant Usage</h3>
                      <p className="text-xs text-stone-400">{analytics.ai.geminiConfigured ? 'Gemini is configured: responses are AI-written but always grounded in your catalogue.' : 'Gemini is not configured (no GEMINI_API_KEY): the built-in rule-based assistant is serving all requests.'}</p>
                    </div>
                  </div>

                  {(() => {
                    const k = analytics.ai.byKind;
                    const n = (kind: string) => (k[kind]?.gemini ?? 0) + (k[kind]?.fallback ?? 0);
                    const topTone = analytics.ai.undertones[0];
                    const toneTotal = analytics.ai.undertones.reduce((t, u) => t + u.count, 0);
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                          <span className="text-stone-400">Shade Matches (30 days)</span>
                          <div className="text-2xl font-bold text-white">{n('shade-match')}</div>
                          <span className="text-[10px] text-stone-400">{k['shade-match']?.gemini ?? 0} with Gemini · {k['shade-match']?.fallback ?? 0} rule-based</span>
                        </div>
                        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                          <span className="text-stone-400">Dominant Undertone</span>
                          <div className="text-2xl font-bold text-amber-300">{topTone ? `${topTone.undertone} (${Math.round((topTone.count / toneTotal) * 100)}%)` : '—'}</div>
                          <span className="text-[10px] text-stone-400">{analytics.ai.undertones.slice(1, 3).map((u) => `${u.undertone} (${Math.round((u.count / toneTotal) * 100)}%)`).join(' · ') || 'No data yet'}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                          <span className="text-stone-400">Routines & Stylist Chats</span>
                          <div className="text-2xl font-bold text-white">{n('skincare-routine') + n('beauty-consultant')}</div>
                          <span className="text-[10px] text-stone-400">{n('skincare-routine')} routines · {n('beauty-consultant')} chats</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Google Maps Grounding & Boutiques */}
                <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-base font-bold text-white">Google Maps Grounding & Boutique Network</h3>
                          <span className="text-[10px] bg-stone-800 text-stone-300 border border-stone-700 px-2 py-0.5 rounded font-semibold">{analytics.ai.geminiConfigured ? 'Maps grounding enabled' : 'Directory only'}</span>
                        </div>
                        <p className="text-xs text-stone-400">Store locator uses Google Maps grounding when Gemini is configured, otherwise the boutique directory in your database.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsAdminOpen(false);
                        openStoreLocator();
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Launch Store Locator</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400">Boutiques in Directory</span>
                      <div className="text-xl font-bold text-white">{analytics.boutiques.count} in {analytics.boutiques.cities} cities</div>
                      <span className="text-[10px] text-stone-400">Edit the boutiques table to manage locations</span>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400">Locator Searches (30 days)</span>
                      <div className="text-xl font-bold text-amber-300">{(analytics.ai.byKind['store-locator']?.gemini ?? 0) + (analytics.ai.byKind['store-locator']?.fallback ?? 0)}</div>
                      <span className="text-[10px] text-stone-400">{analytics.ai.byKind['store-locator']?.gemini ?? 0} grounded by Google Maps</span>
                    </div>
                  </div>
                </div>

                {/* Service Worker & Caches */}
                <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-base font-bold text-white">PWA Service Worker & Offline Cache</h3>
                          <span className="text-[10px] bg-stone-800 text-stone-300 border border-stone-700 px-2 py-0.5 rounded font-semibold">Offline shell</span>
                        </div>
                        <p className="text-xs text-stone-400">Caching critical assets, product catalog payloads, fonts & imagery.</p>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const success = await clearAllCaches();
                        if (success) {
                          addToast('Offline Cache Refreshed', 'Cached product schemas and static assets purged for fresh fetch.', 'info');
                        }
                      }}
                      className="px-4 py-2 bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Purge Stored Caches</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400 text-[11px]">Static Shell</span>
                      <div className="text-sm font-bold text-emerald-400">Precached</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400 text-[11px]">Products API</span>
                      <div className="text-sm font-bold text-white">NetworkFirst (3s)</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400 text-[11px]">Media Assets</span>
                      <div className="text-sm font-bold text-white">StaleWhileRevalidate</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400 text-[11px]">Typography</span>
                      <div className="text-sm font-bold text-white">CacheFirst (1 Year)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modal: Packing Slip */}
        {selectedOrderForSlip && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white text-stone-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold">Sayphora Official Packing Slip</h3>
                  <span className="text-xs text-stone-500 font-mono">Order {selectedOrderForSlip.orderNumber}</span>
                </div>
                <button onClick={() => setSelectedOrderForSlip(null)} className="p-1 text-stone-400 hover:text-stone-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] block mb-1">Ship To:</span>
                  <div className="font-semibold">{selectedOrderForSlip.shippingAddress.fullName}</div>
                  <div>{selectedOrderForSlip.shippingAddress.street}</div>
                  <div>{selectedOrderForSlip.shippingAddress.city}, {selectedOrderForSlip.shippingAddress.zipCode}</div>
                  <div>{selectedOrderForSlip.shippingAddress.country}</div>
                </div>

                <div>
                  <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] block mb-1">Order Details:</span>
                  <div>Date: {selectedOrderForSlip.date}</div>
                  <div>Method: {selectedOrderForSlip.shippingMethod}</div>
                  <div>Carrier Tracking: {selectedOrderForSlip.trackingNumber || 'Pending'}</div>
                  <div>Payment: {selectedOrderForSlip.paymentMethod}</div>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 font-bold">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrderForSlip.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <span className="font-semibold">{item.name}</span>
                          {item.shadeName && <span className="block text-[10px] text-stone-500">{item.shadeName}</span>}
                        </td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right font-bold">{formatPrice(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  <span className="text-stone-500">Order Total: </span>
                  <strong className="text-stone-900 text-sm">{formatPrice(selectedOrderForSlip.total)}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrderForSlip(null)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Product */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                <h3 className="font-serif text-base font-bold text-white">Add New Prestige Product</h3>
                <button onClick={() => setIsAddProductOpen(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    required
                    placeholder="e.g. Dior Addict Lip Glow Oil"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Brand</label>
                    <input
                      type="text"
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      required
                      placeholder="e.g. DIOR"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as Category)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Makeup">Makeup</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Fragrance">Fragrance</option>
                      <option value="Haircare">Haircare</option>
                      <option value="Bath & Body">Bath & Body</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Stock Units</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">High-Res Image URL</label>
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdIsClean}
                      onChange={(e) => setNewProdIsClean(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <span className="text-stone-300">Clean at Sayphora</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdIsBestseller}
                      onChange={(e) => setNewProdIsBestseller(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <span className="text-stone-300">Bestseller</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl mt-2 shadow-lg transition-colors"
                >
                  Publish to Catalog
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add New Promo */}
        {isAddPromoOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                <h3 className="font-serif text-base font-bold text-white">Create New VIP Promo Code</h3>
                <button onClick={() => setIsAddPromoOpen(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePromo} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value)}
                    required
                    placeholder="e.g. GLOW50"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white uppercase font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Discount Type</label>
                    <select
                      value={newPromoType}
                      onChange={(e) => setNewPromoType(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="percent">Percentage Off (%)</option>
                      <option value="amount">Fixed Amount ($)</option>
                      <option value="shipping">Free Shipping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Value (% or $)</label>
                    <input
                      type="number"
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                      disabled={newPromoType === 'shipping'}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white disabled:opacity-40 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={newPromoDesc}
                    onChange={(e) => setNewPromoDesc(e.target.value)}
                    required
                    placeholder="e.g. 20% off all Lipsticks & Glosses"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl mt-2 shadow-lg transition-colors"
                >
                  Activate Promo Code
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
