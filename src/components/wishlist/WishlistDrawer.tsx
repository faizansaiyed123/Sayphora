import React from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Share2, 
  Check,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    moveAllWishlistToBag,
    products,
    formatPrice,
    addToast
  } = useApp();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleShareWishlist = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Wishlist Link Copied', 'Share your curated beauty edit with friends', 'luxury');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
              <h3 className="font-serif text-lg font-bold text-stone-950">
                My Saved Wishlist
              </h3>
              <span className="text-xs text-stone-500 font-semibold">
                ({wishlistProducts.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWishlist}
                className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
                title="Share Wishlist"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-stone-900">Your wishlist is empty</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Tap the heart icon on any product to save your favorites for upcoming seasonal restocks and private VIP events.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlistProducts.map(prod => (
                <div 
                  key={prod.id}
                  className="flex gap-4 p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide truncate">
                          {prod.brand}
                        </span>
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {prod.name}
                      </h4>

                      <div className="text-xs font-bold text-stone-950 mt-1">
                        {formatPrice(prod.price)}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          addToCart(prod, prod.shades?.[0], prod.sizes?.[0], 1);
                        }}
                        className="w-full py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {wishlistProducts.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-2">
              <button
                onClick={moveAllWishlistToBag}
                className="w-full py-3.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Shopping Bag</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
