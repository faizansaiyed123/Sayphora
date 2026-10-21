import React, { useState } from 'react';
import { 
  Star, 
  Heart, 
  Eye, 
  Plus, 
  Check, 
  Camera, 
  SlidersHorizontal,
  Flame,
  Users,
  FlaskConical,
  Sparkles
} from 'lucide-react';
import { Product, Shade } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'editorial';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct,
    formatPrice,
    openVTO,
    toggleCompare,
    comparedProducts,
    openIngredientModal
  } = useApp();

  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades ? product.shades[0] : undefined
  );
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.stockLeft === 0;
  const isFavorite = isInWishlist(product.id);
  const isCompared = comparedProducts.some(p => p.id === product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedShade, product.sizes?.[0], 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleQuickVTO = (e: React.MouseEvent) => {
    e.stopPropagation();
    openVTO(product, selectedShade);
  };

  // If Editorial Magazine View
  if (viewMode === 'editorial') {
    return (
      <div 
        className="group relative flex flex-col sm:flex-row bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Side: Large Visual Imagery */}
        <div 
          onClick={() => setQuickViewProduct(product)}
          className="relative aspect-square sm:aspect-auto sm:w-2/5 overflow-hidden bg-stone-100 cursor-pointer min-h-[260px]"
        >
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
            {product.isBestseller && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-900 text-amber-200 rounded">
                Bestseller
              </span>
            )}
            {product.isClean && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-900 text-emerald-100 rounded">
                Clean Beauty
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
              isFavorite 
                ? 'bg-rose-50 text-rose-600 shadow-sm' 
                : 'bg-white/80 hover:bg-white text-stone-700 hover:text-stone-950 shadow-sm'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
          </button>
        </div>

        {/* Right Side: Editorial Information */}
        <div className="p-6 flex flex-col justify-between flex-1 sm:w-3/5">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                {product.brand}
              </span>
              <span className="text-stone-400 font-mono text-[11px]">{product.category}</span>
            </div>

            <h3 
              onClick={() => setQuickViewProduct(product)}
              className="font-serif text-xl font-bold text-stone-950 hover:text-amber-800 leading-snug cursor-pointer transition-colors mb-2"
            >
              {product.name}
            </h3>

            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Shades selector if available */}
            {product.shades && product.shades.length > 0 && (
              <div className="space-y-1.5 mb-4">
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Selected Shade: <strong className="text-stone-900">{selectedShade?.name}</strong></span>
                  <span className="text-stone-400">{product.shades.length} shades</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.shades.slice(0, 8).map(shade => (
                    <button
                      key={shade.id}
                      onClick={() => setSelectedShade(shade)}
                      title={shade.name}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        selectedShade?.id === shade.id ? 'ring-2 ring-stone-950 scale-125' : 'border-stone-300 hover:scale-110'
                      }`}
                      style={{ backgroundColor: shade.hex }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-stone-700">
                {product.reviewCount > 0 ? (<>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-stone-900">{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 text-[11px]">({product.reviewCount})</span></>) : <span className="text-[11px] text-stone-400">No reviews yet</span>}
              </div>
              <div className="text-base font-bold text-stone-950">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {product.shades && product.shades.length > 0 && (
                <button
                  onClick={handleQuickVTO}
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Try On</span>
                </button>
              )}
              <button
                onClick={() => setQuickViewProduct(product)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={justAdded || soldOut}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white transition-colors ${
                  justAdded ? 'bg-emerald-600' : 'bg-stone-950 hover:bg-stone-850'
                }`}
              >
                {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{soldOut ? 'Sold out' : justAdded ? 'Added' : 'Add to Bag'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid View Card (4 columns)
  return (
    <div 
      className="group relative flex flex-col bg-white border border-stone-200/80 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div 
        onClick={() => setQuickViewProduct(product)}
        className="relative aspect-square w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={isHovered && product.hoverImage ? product.hoverImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges & Live Urgency */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {product.isBestseller && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-900 text-amber-200 rounded">
              Bestseller
            </span>
          )}
          {product.isClean && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-900 text-emerald-100 rounded">
              Clean Beauty
            </span>
          )}
          {product.isSale && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-900 text-rose-100 rounded">
              Special Offer
            </span>
          )}
          {product.stockLeft === 0 && (
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 bg-stone-900 text-white rounded shadow-xs">Sold out</span>
          )}
          {product.stockLeft !== undefined && product.stockLeft > 0 && product.stockLeft <= 5 && (
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 bg-amber-500 text-stone-950 rounded flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 fill-stone-950" />
              <span>Only {product.stockLeft} left</span>
            </span>
          )}
        </div>

        {/* Top Right Actions: Wishlist & Compare */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isFavorite 
                ? 'bg-rose-50 text-rose-600 shadow-sm' 
                : 'bg-white/80 hover:bg-white text-stone-700 hover:text-stone-950 shadow-sm'
            }`}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isCompared
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-stone-700 hover:text-stone-950 shadow-sm'
            }`}
            title={isCompared ? 'Remove from comparison' : 'Compare formula'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
          {product.shades && product.shades.length > 0 && (
            <button
              onClick={handleQuickVTO}
              className="px-2.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1 transition-colors"
              title="Virtual Try-On"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Try On</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold py-2.5 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleQuickAdd}
            disabled={justAdded || soldOut}
            className={`px-3 py-2.5 rounded-lg shadow-md text-xs font-semibold flex items-center justify-center transition-colors ${
              justAdded 
                ? 'bg-emerald-600 text-white' 
                : 'bg-stone-950 hover:bg-stone-850 text-white'
            }`}
            title="Quick Add to Bag"
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand & Category */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
          <span className="font-semibold text-stone-800 tracking-wide uppercase text-[11px]">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{product.subcategory}</span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => setQuickViewProduct(product)}
          className="text-sm font-semibold text-stone-900 hover:text-amber-800 line-clamp-2 leading-snug cursor-pointer transition-colors mb-2 min-h-[2.5rem]"
        >
          {product.name}
        </h3>

        {/* Shade Swatches Preview */}
        {product.shades && product.shades.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 overflow-hidden">
            <div className="flex items-center gap-1">
              {product.shades.slice(0, 5).map(shade => (
                <button
                  key={shade.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShade(shade);
                  }}
                  title={shade.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                    selectedShade?.id === shade.id ? 'ring-2 ring-stone-900 scale-110' : 'border-stone-300'
                  }`}
                  style={{ backgroundColor: shade.hex }}
                />
              ))}
            </div>
            {product.shades.length > 5 && (
              <span className="text-[10px] text-stone-500 font-medium">
                +{product.shades.length - 5}
              </span>
            )}
            {selectedShade && (
              <span className="text-[10px] text-stone-500 truncate ml-1">
                {selectedShade.id}
              </span>
            )}
          </div>
        )}

        {/* Rating and Price Footer */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-stone-100">
          <div className="flex items-center gap-1 text-xs text-stone-600">
            {product.reviewCount > 0 ? (<>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-stone-900">{product.rating.toFixed(1)}</span>
            <span className="text-stone-400 text-[11px]">({product.reviewCount.toLocaleString()})</span></>) : <span className="text-[11px] text-stone-400">No reviews yet</span>}
          </div>

          <div className="flex items-baseline gap-1.5">
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-sm font-bold text-stone-950">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
