import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { FilterBar } from './components/home/FilterBar';
import { ShadeVisualizer } from './components/home/ShadeVisualizer';
import { BeautyInsiderBanner } from './components/home/BeautyInsiderBanner';
import { ProductCard } from './components/product/ProductCard';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AIBeautyStudioModal } from './components/ai/AIBeautyStudioModal';
import { VirtualTryOnModal } from './components/vto/VirtualTryOnModal';
import { IngredientDecoderModal } from './components/product/IngredientDecoderModal';
import { ProductCompareModal } from './components/compare/ProductCompareModal';
import { BeautyInsiderModal } from './components/loyalty/BeautyInsiderModal';
import { OrderTrackingModal } from './components/order-tracking/OrderTrackingModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BoutiqueLocatorModal } from './components/locator/BoutiqueLocatorModal';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { ToastContainer } from './components/ui/ToastContainer';
import { Sparkles, ShoppingBag, RotateCcw } from 'lucide-react';

const MainCatalog: React.FC = () => {
  const { 
    filteredProducts, 
    filters, 
    resetFilters,
    quickViewProduct, 
    setQuickViewProduct,
    isAdminOpen,
    setIsAdminOpen,
    viewMode,
    products,
    productsLoading,
    productsError,
    reloadProducts
  } = useApp();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(!isAdminOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen, setIsAdminOpen]);

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* Editorial Hero Banner */}
      {filters.category === 'All' && !filters.searchQuery && (
        <HeroBanner />
      )}

      {/* Filter and Sorting Controls */}
      <FilterBar />

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {products.length === 0 && productsLoading ? (
          <div role="status" aria-label="Loading products" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-4/5 rounded-2xl bg-stone-200" />
                <div className="h-3 w-2/3 rounded bg-stone-200" />
                <div className="h-3 w-1/3 rounded bg-stone-200" />
              </div>
            ))}
          </div>
        ) : products.length === 0 && productsError ? (
          <div role="alert" className="py-20 text-center space-y-4 max-w-md mx-auto">
            <h3 className="text-lg font-serif font-bold text-stone-900">We couldn't load the collection</h3>
            <p className="text-xs text-stone-500">{productsError}</p>
            <button onClick={reloadProducts} className="px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 inline-flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /><span>Try again</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                No matching beauty items found
              </h3>
              <p className="text-xs text-stone-500">
                We couldn't find any products matching your current combination of filters and search keywords.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-850 inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'editorial'
              ? "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          }>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Virtual Shade Swatch Bar */}
      <ShadeVisualizer />

      {/* VIP Rewards Club Banner */}
      <BeautyInsiderBanner />

      {/* Modals & Slide-outs */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <AIBeautyStudioModal />
      <VirtualTryOnModal />
      <IngredientDecoderModal />
      <ProductCompareModal />
      <BeautyInsiderModal />
      <OrderTrackingModal />
      <AuthModal />
      <AdminDashboard />
      <BoutiqueLocatorModal />
      <ToastContainer />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen text-stone-900 selection:bg-amber-200 selection:text-stone-950">
        <OfflineBanner />
        <Navbar />
        <MainCatalog />
        <Footer />
      </div>
    </AppProvider>
  );
}
