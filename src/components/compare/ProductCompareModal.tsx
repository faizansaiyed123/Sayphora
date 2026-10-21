import React from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  Star, 
  Check, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductCompareModal: React.FC = () => {
  const {
    comparedProducts,
    isCompareOpen,
    setIsCompareOpen,
    toggleCompare,
    clearCompare,
    addToCart,
    formatPrice
  } = useApp();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-stone-900" />
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-950">
                Formula Comparison Matrix
              </h3>
              <p className="text-[11px] text-stone-500">
                Side-by-side analysis of finish, coverage, key bio-actives, and pricing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-stone-500 hover:text-rose-600 font-semibold"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table / Grid */}
        <div className="overflow-x-auto flex-1 p-6">
          {comparedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-800">No items selected for comparison</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Click "Compare" on any product card or quick view to inspect formulations side-by-side.
              </p>
            </div>
          ) : (
            <div className="min-w-[650px] space-y-4">
              <div className="grid grid-cols-5 gap-4 border-b border-stone-200 pb-4">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider self-end pb-2">
                  Products ({comparedProducts.length}/4)
                </div>

                {comparedProducts.map(prod => (
                  <div key={prod.id} className="relative flex flex-col justify-between">
                    <button
                      onClick={() => toggleCompare(prod)}
                      className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-stone-100 rounded-full text-stone-400 hover:text-rose-600 shadow-xs z-10"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="text-[10px] font-bold text-stone-500 uppercase">{prod.brand}</div>
                    <div className="text-xs font-semibold text-stone-900 line-clamp-1">{prod.name}</div>
                    <div className="text-xs font-bold text-stone-950 mt-1">{formatPrice(prod.price)}</div>

                    <button
                      onClick={() => addToCart(prod, prod.shades?.[0], prod.sizes?.[0], 1)}
                      className="mt-2 w-full py-1.5 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}

                {/* Fill empty slots up to 4 */}
                {[...Array(4 - comparedProducts.length)].map((_, i) => (
                  <div key={i} className="border-2 border-dashed border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center text-center text-stone-400">
                    <Plus className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[11px]">Add Product</span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-3 text-xs">
                {/* Rating */}
                <div className="grid grid-cols-5 gap-4 py-2 border-b border-stone-100 items-center">
                  <span className="font-semibold text-stone-500">Customer Rating</span>
                  {comparedProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-1 font-bold text-stone-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.rating.toFixed(1)}</span>
                      <span className="text-stone-400 text-[10px]">({p.reviewCount})</span>
                    </div>
                  ))}
                </div>

                {/* Finish & Coverage */}
                <div className="grid grid-cols-5 gap-4 py-2 border-b border-stone-100 items-center">
                  <span className="font-semibold text-stone-500">Finish & Coverage</span>
                  {comparedProducts.map(p => (
                    <div key={p.id} className="text-stone-800">
                      <div>{p.finish ? `${p.finish} Finish` : 'Natural Veil'}</div>
                      <div className="text-stone-400 text-[11px]">{p.coverage ? `${p.coverage} Coverage` : 'Targeted Treatment'}</div>
                    </div>
                  ))}
                </div>

                {/* Skin Type Compatibility */}
                <div className="grid grid-cols-5 gap-4 py-2 border-b border-stone-100 items-center">
                  <span className="font-semibold text-stone-500">Best For Skin Types</span>
                  {comparedProducts.map(p => (
                    <div key={p.id} className="text-stone-800 text-[11px]">
                      {p.skinTypes ? p.skinTypes.join(', ') : 'All Skin Types'}
                    </div>
                  ))}
                </div>

                {/* Clean Standard */}
                <div className="grid grid-cols-5 gap-4 py-2 border-b border-stone-100 items-center">
                  <span className="font-semibold text-stone-500">Clean Status</span>
                  {comparedProducts.map(p => (
                    <div key={p.id}>
                      {p.isClean ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3 text-emerald-600" /> Clean Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">Clinical Formulation</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key Bio-Active */}
                <div className="grid grid-cols-5 gap-4 py-2 items-start">
                  <span className="font-semibold text-stone-500">Key Bio-Actives</span>
                  {comparedProducts.map(p => (
                    <div key={p.id} className="text-[11px] text-stone-700 space-y-1">
                      {p.ingredientAnalysis?.actives.slice(0, 2).map((a, i) => (
                        <div key={i} className="font-medium">• {a.name}</div>
                      )) || <div className="text-stone-400">Proprietary Complex</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
