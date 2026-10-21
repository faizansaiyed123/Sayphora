import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Gift, 
  Check, 
  Tag, 
  Sparkles,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    appliedPromo,
    applyPromo,
    removePromo,
    selectedSamples,
    toggleSample,
    setIsCheckoutOpen,
    samples,
    computeCartPricing,
    pricingRules,
    formatPrice
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const pricing = computeCartPricing('Standard');
  const subtotal = pricing.subtotalCents / 100;
  const discount = pricing.discountCents / 100;
  const shippingCost = pricing.shippingCents / 100;
  const isFreeShipping = pricing.shippingCents === 0;
  const freeShippingThreshold = pricingRules.freeShippingThresholdCents / 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim() || applying) return;
    setApplying(true);
    const res = await applyPromo(promoInput);
    setApplying(false);
    setPromoMessage({ text: res.message, error: !res.success });
    if (res.success) setPromoInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="font-serif text-lg font-bold text-stone-950">
                Shopping Bag
              </h2>
              <span className="text-xs text-stone-500 font-semibold">
                ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-stone-50 px-5 py-3 border-b border-stone-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-medium text-stone-800">
                <Truck className="w-3.5 h-3.5 text-stone-600" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-semibold">
                    Complimentary Standard Shipping Unlocked!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-stone-950">{formatPrice(amountToFreeShipping)}</strong> more for Free Shipping
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-stone-500">
                {Math.round(freeShippingPercent)}%
              </span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-stone-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-stone-900">Your bag is empty</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our curated collection of luxury skincare, cosmetics, and fragrance to find your signature glow.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-850 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-4">
                  {cart.map(item => (
                    <div 
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl border border-stone-200/80 bg-white hover:border-stone-300 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide truncate">
                              {item.product.brand}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>

                          {/* Selected shade info */}
                          {item.selectedShade && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-600">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0" 
                                style={{ backgroundColor: item.selectedShade.hex }}
                              />
                              <span className="truncate">{item.selectedShade.name}</span>
                            </div>
                          )}

                          {item.selectedSize && (
                            <div className="text-[11px] text-stone-500">
                              Size: {item.selectedSize}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-stone-500 hover:text-stone-900"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-stone-500 hover:text-stone-900"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-stone-950">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Complimentary Deluxe Samples Selector */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <span>Choose 2 Complimentary Samples</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800">
                      {selectedSamples.length}/2 Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Complimentary deluxe trial miniatures added to your parcel.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {samples.map(sample => {
                      const isSelected = selectedSamples.some(s => s.id === sample.id);
                      return (
                        <button
                          key={sample.id}
                          onClick={() => toggleSample(sample)}
                          className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                            isSelected 
                              ? 'bg-white border-amber-500 ring-1 ring-amber-500 shadow-xs' 
                              : 'bg-white/80 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <img 
                            src={sample.image} 
                            alt={sample.name} 
                            className="w-8 h-8 rounded object-cover shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] font-bold text-stone-500 uppercase truncate">
                              {sample.brand}
                            </div>
                            <div className="text-[10px] font-medium text-stone-900 line-clamp-1">
                              {sample.name}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="space-y-2">
                  {appliedPromo ? (
                    <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-stone-700" />
                        <div>
                          <span className="font-bold text-stone-900">{appliedPromo.code}</span>
                          <p className="text-[10px] text-stone-500">{appliedPromo.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={removePromo}
                        className="text-stone-500 hover:text-stone-900 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo or reward code"
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900 uppercase"
                      />
                      <button
                        type="submit"
                        disabled={applying}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {promoMessage && (
                    <div className={`text-[11px] ${promoMessage.error ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {promoMessage.text}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Cart Footer / Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-stone-800">
                    {isFreeShipping ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Estimated Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span>{formatPrice((pricing.subtotalCents - pricing.discountCents + pricing.shippingCents) / 100)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-stone-400">
                Secure checkout · prices and stock are confirmed when you place your order
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
