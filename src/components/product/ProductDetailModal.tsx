import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Check, 
  Plus, 
  Minus,
  Info,
  ChevronDown,
  MessageSquare,
  Camera,
  FlaskConical,
  SlidersHorizontal,
  Flame,
  Users,
  MapPin
} from 'lucide-react';
import { Product, Shade } from '../../types';
import { useApp } from '../../context/AppContext';
import { BundleUpsell } from './BundleUpsell';
import { ProductImageMagnifier } from './ProductImageMagnifier';
import { ProductReviewsSection } from './ProductReviewsSection';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    openAIStudio,
    openVTO,
    openIngredientModal,
    toggleCompare,
    comparedProducts,
    formatPrice,
    openStoreLocator,
    selectedBoutique,
    getProductReviews
  } = useApp();

  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades ? product.shades[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'howTo' | 'ingredients' | 'reviews'>('details');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productReviews = getProductReviews(product.id);
  const soldOut = product.stockLeft === 0;
  const isFavorite = isInWishlist(product.id);
  const isCompared = comparedProducts.some(p => p.id === product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedShade, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Visual Gallery & Interactive High-Fidelity Magnifier */}
            <div className="space-y-4">
              <ProductImageMagnifier product={product} selectedShade={selectedShade} />

              {/* Action Toolbar for Pro Features (Try On, Ingredients, Compare) */}
              <div className="grid grid-cols-3 gap-2">
                {product.shades && product.shades.length > 0 ? (
                  <button
                    onClick={() => openVTO(product, selectedShade)}
                    className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-sm transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Virtual Try-On</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openAIStudio('routine')}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Regimen</span>
                  </button>
                )}

                <button
                  onClick={() => openIngredientModal(product)}
                  className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <FlaskConical className="w-4 h-4 text-emerald-600" />
                  <span>Decode Actives</span>
                </button>

                <button
                  onClick={() => toggleCompare(product)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                    isCompared
                      ? 'bg-stone-950 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{isCompared ? 'Compared ✓' : 'Compare'}</span>
                </button>
              </div>

              {/* Awards Notice */}
              {product.awards && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">{product.awards}</span>
                </div>
              )}
            </div>

            {/* Right Column: Information & Actions */}
            <div className="flex flex-col">
              {/* Brand and Kicker */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-1">
                <span className="uppercase tracking-wider font-bold text-stone-800">{product.brand}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-950 mb-3 leading-tight">
                {product.name}
              </h2>

              {/* Rating & Reviews Jump */}
              <div className="flex items-center gap-2 text-xs text-stone-600 mb-4 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-stone-200 text-stone-200'
                      }`}
                    />
                  ))}
                  {product.reviewCount > 0 && <span className="font-bold text-stone-900 ml-1">{product.rating.toFixed(1)}</span>}
                </div>
                <span className="text-stone-400">·</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="underline hover:text-stone-950"
                >
                  {product.reviewCount > 0 ? `${product.reviewCount.toLocaleString()} ${product.reviewCount === 1 ? 'Review' : 'Reviews'}` : 'Be the first to review'}
                </button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-stone-950">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.isSale && (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Save {formatPrice(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Shade Selection (if available) */}
              {product.shades && product.shades.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700">
                      Color / Shade: <strong className="text-stone-950">{selectedShade?.name}</strong>
                    </span>
                    <button
                      onClick={() => openVTO(product, selectedShade)}
                      className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Live Mirror Try-On</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.shades.map(shade => (
                      <button
                        key={shade.id}
                        onClick={() => setSelectedShade(shade)}
                        title={shade.name}
                        className={`w-7 h-7 rounded-full border-2 transition-all relative ${
                          selectedShade?.id === shade.id
                            ? 'border-stone-950 scale-110 shadow-sm'
                            : 'border-white hover:scale-105'
                        }`}
                        style={{ backgroundColor: shade.hex }}
                      >
                        {selectedShade?.id === shade.id && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-3 h-3 ${parseInt(shade.hex.replace('#',''), 16) > 0x888888 ? 'text-stone-900' : 'text-white'}`} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection (if available) */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="text-xs font-medium text-stone-700">
                    Size: <strong className="text-stone-950">{selectedSize}</strong>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs px-3.5 py-2 rounded-lg border font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-stone-200 hover:border-stone-400 text-stone-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart Controls */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-stone-200 rounded-lg p-1 bg-stone-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-stone-600 hover:text-stone-950 rounded hover:bg-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-stone-600 hover:text-stone-950 rounded hover:bg-white"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addedSuccess || soldOut}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-stone-950 hover:bg-stone-850 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{soldOut ? 'Sold out' : `Add to Bag — ${formatPrice(product.price * quantity)}`}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-xl border border-stone-200 transition-colors ${
                    isFavorite
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* In-Store Availability & 2-Hour Pickup with Google Maps Grounding */}
              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-stone-900 truncate">
                      Store Pickup: {selectedBoutique ? selectedBoutique.name : 'Sayphora Flagship Atelier'}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Ready in 2 hours · In-store shade matching & testing
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openStoreLocator(`Check availability for ${product.name}`, product.brand)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-900 font-bold text-[11px] rounded-lg border border-stone-300 shadow-2xs whitespace-nowrap transition-colors shrink-0 hover:border-amber-400"
                >
                  Find Nearby
                </button>
              </div>

              {/* Frequently Paired Bundle Upsell */}
              <BundleUpsell mainProduct={product} />

              {/* Shipping & Authentic Guarantees */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-[11px] text-stone-600 mb-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-stone-800" />
                  <span>Free Standard Delivery on orders over {formatPrice(50)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-800" />
                  <span>Free 30-Day Returns · 100% Authentic Guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Extended Product Insights & Customer Reviews */}
          <div className="border-t border-stone-200 pt-8 mt-8">
            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wider border-b border-stone-200 pb-3 mb-6 overflow-x-auto">
              {(['details', 'howTo', 'ingredients', 'reviews'] as const).map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`pb-2 transition-colors relative whitespace-nowrap ${
                    activeTab === tabKey
                      ? 'text-stone-950 font-bold border-b-2 border-stone-950 -mb-[13px]'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tabKey === 'details' && 'Formula & Performance Details'}
                  {tabKey === 'howTo' && 'Suggested Ritual & Application'}
                  {tabKey === 'ingredients' && 'Clean Diagnostic & Actives'}
                  {tabKey === 'reviews' && `Verified Client Reviews (${productReviews.length})`}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === 'details' && (
                <div className="space-y-4 max-w-3xl">
                  <p className="text-sm text-stone-700 leading-relaxed">{product.description}</p>
                  <div className="font-semibold text-stone-900 text-xs uppercase tracking-wider">Formula Highlights:</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    {product.details.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'howTo' && (
                <div className="space-y-3 max-w-3xl">
                  <div className="font-serif font-bold text-stone-900 text-sm mb-2">Master Artist Ritual Steps:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.howToUse.map((step, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-700">
                        <span className="w-6 h-6 rounded-full bg-stone-950 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                    <div>
                      <span className="font-serif font-bold text-emerald-950 block text-sm">Clean & Clinical Standards</span>
                      <span className="text-xs text-emerald-800">Formulated without parabens, phthalates, sulfates, or synthetic fragrance.</span>
                    </div>
                    <button
                      onClick={() => openIngredientModal(product)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>View Full Safety Diagnostic</span>
                    </button>
                  </div>

                  <div>
                    <div className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-2">Full Ingredients List:</div>
                    <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono">
                      {product.ingredients}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ProductReviewsSection product={product} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
