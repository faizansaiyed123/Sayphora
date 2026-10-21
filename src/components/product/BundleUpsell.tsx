import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface BundleUpsellProps {
  mainProduct: Product;
}

export const BundleUpsell: React.FC<BundleUpsellProps> = ({ mainProduct }) => {
  const { products, addToCart, formatPrice, addToast } = useApp();

  const companionIds = mainProduct.frequentlyBoughtWith || [];
  const companionProducts = products.filter(p => companionIds.includes(p.id)).slice(0, 2);

  const [selectedIds, setSelectedIds] = useState<string[]>([
    mainProduct.id,
    ...companionProducts.map(p => p.id)
  ]);

  if (companionProducts.length === 0) return null;

  const allBundleProducts = [mainProduct, ...companionProducts];
  const activeProducts = allBundleProducts.filter(p => selectedIds.includes(p.id));

  const rawTotal = activeProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscountRate = activeProducts.length >= 2 ? 0.15 : 0; // 15% bundle saving
  const savings = rawTotal * bundleDiscountRate;
  const bundlePrice = rawTotal - savings;

  const toggleSelect = (id: string) => {
    if (id === mainProduct.id) return; // cannot deselect main product
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddBundleToBag = () => {
    activeProducts.forEach(prod => {
      addToCart(prod, prod.shades?.[0], prod.sizes?.[0], 1);
    });
    if (bundleDiscountRate > 0) {
      addToast('Curated Bundle Added', `Saved ${formatPrice(savings)} with 15% Routine Bundle discount!`, 'luxury');
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
            Frequently Paired Together
          </h4>
        </div>
        {bundleDiscountRate > 0 && (
          <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Save 15% as Bundle</span>
          </span>
        )}
      </div>

      {/* Visual Bundle Equation */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {allBundleProducts.map((prod, idx) => {
          const isChecked = selectedIds.includes(prod.id);
          return (
            <React.Fragment key={prod.id}>
              {idx > 0 && <Plus className="w-4 h-4 text-stone-400 shrink-0" />}
              
              <div
                onClick={() => toggleSelect(prod.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border bg-white shrink-0 cursor-pointer transition-all ${
                  isChecked 
                    ? 'border-amber-500 ring-1 ring-amber-400 shadow-xs' 
                    : 'border-stone-200 opacity-60'
                }`}
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  {isChecked && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-stone-950 text-white flex items-center justify-center text-[9px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 max-w-[130px]">
                  <div className="text-[9px] font-bold text-stone-400 uppercase truncate">{prod.brand}</div>
                  <div className="text-[11px] font-semibold text-stone-900 truncate">{prod.name}</div>
                  <div className="text-xs font-bold text-stone-950">{formatPrice(prod.price)}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary & Add Bundle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/70 text-xs">
        <div>
          <div className="text-stone-600">
            Combined Total ({activeProducts.length} items):
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-950">{formatPrice(bundlePrice)}</span>
            {savings > 0 && (
              <span className="text-stone-400 line-through text-xs">{formatPrice(rawTotal)}</span>
            )}
            {savings > 0 && (
              <span className="text-emerald-700 font-semibold text-[11px]">
                You save {formatPrice(savings)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddBundleToBag}
          className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add Complete Routine to Bag</span>
        </button>
      </div>
    </div>
  );
};
