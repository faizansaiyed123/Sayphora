import React, { useEffect, useState } from 'react';
import { X, Check, Truck, ShieldCheck, Sparkles, ArrowRight, Download, Gift, Loader2, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Address, Order, GiftOption } from '../../types';
import { ApiError, errorMessage } from '../../lib/api';
import type { ShippingMethod } from '../../../shared/commerce';

const EMPTY_ADDRESS: Address = { fullName: '', street: '', apt: '', city: '', state: '', zipCode: '', country: 'United States', phone: '' };
const field = 'w-full text-xs p-2.5 border rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-900';

export const CheckoutModal: React.FC = () => {
  const {
    cart, selectedSamples, appliedPromo, isCheckoutOpen, setIsCheckoutOpen, createOrder, user, openOrderTracking,
    formatPrice, currency, computeCartPricing, pricingRules, paymentProvider, saveAddress,
    setAuthMode, setIsAuthModalOpen, giftOption: ctxGift
  } = useApp();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [saveForLater, setSaveForLater] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('Standard');
  const [isGift, setIsGift] = useState(ctxGift.isGift);
  const [giftWrapType, setGiftWrapType] = useState<GiftOption['giftWrapType']>(ctxGift.giftWrapType);
  const [cardMessage, setCardMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill from the member's saved address (or at least their name) each time checkout opens.
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const saved = user?.savedAddresses?.[0];
    setAddress(saved ? { ...EMPTY_ADDRESS, ...saved } : { ...EMPTY_ADDRESS, fullName: user?.name ?? '', phone: user?.phone ?? '' });
    setStep('shipping'); setSubmitError(null); setErrors({}); setCreatedOrder(null);
  }, [isCheckoutOpen, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isCheckoutOpen) return null;

  const close = () => setIsCheckoutOpen(false);

  if (!user) {
    return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <h3 className="font-serif text-xl font-bold text-stone-950">Sign in to check out</h3>
          <p className="text-xs text-stone-500">Create a free account (or sign in) so we can save your order, track delivery and award Beauty Insider points. Your bag is kept.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => { close(); setAuthMode('signin'); setIsAuthModalOpen(true); }} className="px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold">Sign In</button>
            <button onClick={() => { close(); setAuthMode('signup'); setIsAuthModalOpen(true); }} className="px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold">Create Account</button>
          </div>
          <button onClick={close} className="text-[11px] text-stone-400 hover:text-stone-700">Cancel</button>
        </div>
      </div>
    );
  }

  const pricing = computeCartPricing(shippingMethod, { isGift, giftWrapType });
  const dollars = (c: number) => c / 100;
  const standardIsFree = pricing.freeShipping || pricing.subtotalCents >= pricingRules.freeShippingThresholdCents;

  const validateAddress = (): boolean => {
    const e: Record<string, string> = {};
    if (!address.fullName.trim()) e.fullName = 'Required';
    if (!address.street.trim()) e.street = 'Required';
    if (!address.city.trim()) e.city = 'Required';
    if (address.zipCode.trim().length < 2) e.zipCode = 'Required';
    if (!address.country.trim()) e.country = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true); setSubmitError(null);
    try {
      const order = await createOrder(address, shippingMethod, { isGift, giftWrapType, cardMessage: isGift ? cardMessage : undefined });
      if (saveForLater && !user.savedAddresses?.some((a) => a.street === address.street && a.zipCode === address.zipCode)) saveAddress(address);
      setCreatedOrder(order);
      setStep('confirmation');
      try { confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } }); } catch { /* decorative */ }
    } catch (err) {
      setSubmitError(errorMessage(err));
      if (err instanceof ApiError && err.fields) {
        setErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k.replace('shippingAddress.', ''), v])));
        setStep('shipping');
      }
    } finally {
      setPlacing(false);
    }
  };

  const bind = (k: keyof Address) => ({
    value: (address[k] as string) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, [k]: e.target.value }),
    'aria-invalid': !!errors[k],
    className: `${field} ${errors[k] ? 'border-red-400' : 'border-stone-200'}`
  });
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="text-[11px] text-red-600 mt-0.5">{errors[k]}</p> : null);

  const methods: Array<{ id: ShippingMethod; label: string; eta: string; cost: number }> = [
    { id: 'Standard', label: 'Standard Ground', eta: '3–5 Business Days', cost: standardIsFree ? 0 : pricingRules.shippingCents.Standard },
    { id: 'Express', label: 'Express Priority', eta: '2 Business Days', cost: pricing.freeShipping ? 0 : pricingRules.shippingCents.Express },
    { id: 'Next-Day', label: 'Next-Day Air', eta: 'Delivered next business day', cost: pricing.freeShipping ? 0 : pricingRules.shippingCents['Next-Day'] }
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label="Checkout" className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold tracking-widest text-stone-950 uppercase">SAYPHORA</span>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs font-semibold text-stone-700">
              {step === 'shipping' && 'Step 1: Shipping & Delivery'}
              {step === 'payment' && 'Step 2: Payment & Review'}
              {step === 'confirmation' && 'Order Confirmed'}
            </span>
          </div>
          <button onClick={close} aria-label="Close checkout" className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {step !== 'confirmation' && cart.length === 0 && (
            <div className="text-center py-10 text-sm text-stone-500">Your bag is empty. <button className="underline" onClick={close}>Continue shopping</button></div>
          )}

          {step === 'shipping' && cart.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-950 mb-1">Shipping Destination</h3>
                <p className="text-xs text-stone-500">Enter your address for insured luxury delivery.</p>
              </div>
              {user.savedAddresses.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {user.savedAddresses.map((a, i) => (
                    <button key={a.id ?? i} type="button" onClick={() => setAddress({ ...EMPTY_ADDRESS, ...a })} className="text-[11px] px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-900">
                      {a.street}, {a.city}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="co-name" className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label><input id="co-name" autoComplete="name" {...bind('fullName')} /><Err k="fullName" /></div>
                <div><label htmlFor="co-phone" className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label><input id="co-phone" autoComplete="tel" {...bind('phone')} /></div>
                <div className="sm:col-span-2"><label htmlFor="co-street" className="block text-xs font-semibold text-stone-700 mb-1">Street Address</label><input id="co-street" autoComplete="address-line1" {...bind('street')} /><Err k="street" /></div>
                <div><label htmlFor="co-apt" className="block text-xs font-semibold text-stone-700 mb-1">Apartment, Suite, Unit</label><input id="co-apt" autoComplete="address-line2" {...bind('apt')} /></div>
                <div><label htmlFor="co-city" className="block text-xs font-semibold text-stone-700 mb-1">City</label><input id="co-city" autoComplete="address-level2" {...bind('city')} /><Err k="city" /></div>
                <div><label htmlFor="co-state" className="block text-xs font-semibold text-stone-700 mb-1">State / Province</label><input id="co-state" autoComplete="address-level1" {...bind('state')} /></div>
                <div><label htmlFor="co-zip" className="block text-xs font-semibold text-stone-700 mb-1">Postal / ZIP Code</label><input id="co-zip" autoComplete="postal-code" {...bind('zipCode')} /><Err k="zipCode" /></div>
                <div className="sm:col-span-2"><label htmlFor="co-country" className="block text-xs font-semibold text-stone-700 mb-1">Country</label><input id="co-country" autoComplete="country-name" {...bind('country')} /><Err k="country" /></div>
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} className="accent-stone-950" /> Save this address to my account
              </label>

              <div className="pt-4 border-t border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">Select Delivery Speed</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
                  {methods.map((m) => (
                    <button key={m.id} type="button" role="radio" aria-checked={shippingMethod === m.id} onClick={() => setShippingMethod(m.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${shippingMethod === m.id ? 'border-stone-950 bg-stone-50 ring-1 ring-stone-950' : 'border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex justify-between items-start text-xs font-semibold text-stone-900"><span>{m.label}</span><span>{m.cost === 0 ? 'Free' : formatPrice(dollars(m.cost))}</span></div>
                      <div className="text-[11px] text-stone-500 mt-1">{m.eta}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-amber-50/50 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-xs font-bold text-stone-900"><Gift className="w-4 h-4 text-amber-700" /> Gift Packaging & Card</span>
                  <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="w-4 h-4 accent-stone-950" aria-label="Add gift packaging" />
                </label>
                {isGift && (
                  <div className="pt-2 border-t border-amber-200/60 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(['Signature Black & Gold Box', 'Eco Velvet Pouch'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setGiftWrapType(t)}
                          className={`p-2.5 rounded-lg border text-left font-medium ${giftWrapType === t ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-800'}`}>
                          <div>{t === 'Eco Velvet Pouch' ? 'Eco Velvet Pouch' : 'Signature Black Box'}</div>
                          <div className="text-[10px] opacity-80">+ {formatPrice(dollars(pricingRules.giftFeeCents[t]))}</div>
                        </button>
                      ))}
                    </div>
                    <div>
                      <label htmlFor="co-card" className="block text-[11px] font-semibold text-stone-700 mb-1">Card message (max 300 characters)</label>
                      <textarea id="co-card" rows={2} maxLength={300} value={cardMessage} onChange={(e) => setCardMessage(e.target.value)} placeholder="Write a gift message to be printed on the card…" className="w-full text-xs p-2.5 border border-stone-200 rounded-lg bg-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={() => validateAddress() && setStep('payment')} className="px-6 py-3 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-colors">
                  <span>Continue to Review</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && cart.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-950 mb-1">Payment & Review</h3>
                <p className="text-xs text-stone-500">Review your order. Final prices and availability are confirmed when you place it.</p>
              </div>

              {paymentProvider === 'manual' && (
                <div className="p-4 rounded-xl border border-stone-950 bg-stone-50 flex gap-3 items-start">
                  <Banknote className="w-5 h-5 text-stone-900 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-stone-950">Pay on delivery</div>
                    <p className="text-stone-600 mt-1">No payment details are needed now. You will pay {formatPrice(dollars(pricing.totalCents))} when your parcel arrives.</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="font-bold text-stone-900 uppercase tracking-wider mb-2">Order Breakdown ({cart.reduce((n, i) => n + i.quantity, 0)} items + {selectedSamples.length} samples)</div>
                <div className="flex justify-between text-stone-600"><span>Merchandise Subtotal</span><span>{formatPrice(dollars(pricing.subtotalCents))}</span></div>
                {pricing.discountCents > 0 && <div className="flex justify-between text-emerald-700 font-semibold"><span>Promotion ({appliedPromo?.code})</span><span>-{formatPrice(dollars(pricing.discountCents))}</span></div>}
                {pricing.giftFeeCents > 0 && <div className="flex justify-between text-stone-600"><span>Gift Packaging ({giftWrapType})</span><span>{formatPrice(dollars(pricing.giftFeeCents))}</span></div>}
                <div className="flex justify-between text-stone-600"><span>Shipping ({shippingMethod})</span><span>{pricing.shippingCents === 0 ? 'Free' : formatPrice(dollars(pricing.shippingCents))}</span></div>
                <div className="flex justify-between text-stone-600"><span>Estimated Sales Tax ({(pricingRules.taxRate * 100).toFixed(3).replace(/\.?0+$/, '')}%)</span><span>{formatPrice(dollars(pricing.taxCents))}</span></div>
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200"><span>Total Due</span><span>{formatPrice(dollars(pricing.totalCents))}</span></div>
                {currency !== 'USD' && <p className="text-[10px] text-stone-400">Shown in {currency} for reference using indicative rates. Your order is charged in USD: ${dollars(pricing.totalCents).toFixed(2)}.</p>}
                <div className="text-[11px] text-amber-800 pt-1 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-600" /><span>You will earn <strong>+{pricing.pointsEarned} Beauty Insider Points</strong> on this order.</span></div>
              </div>

              <div className="text-xs text-stone-600 p-3 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900 mb-0.5">Ship to</div>
                {address.fullName} · {address.street}{address.apt ? `, ${address.apt}` : ''}, {address.city}{address.state ? `, ${address.state}` : ''} {address.zipCode}, {address.country}
              </div>

              {submitError && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-800">{submitError}</div>}

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep('shipping')} className="text-xs font-semibold text-stone-600 hover:text-stone-950">← Back to Shipping</button>
                <button type="button" onClick={handlePlaceOrder} disabled={placing}
                  className="px-8 py-3.5 bg-stone-950 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-2">
                  {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  <span>{placing ? 'Placing order…' : `Place Order (${formatPrice(dollars(pricing.totalCents))})`}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && createdOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md"><Check className="w-8 h-8" /></div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Thank You for Your Order</span>
                <h3 className="text-2xl font-serif font-bold text-stone-950">Order #{createdOrder.orderNumber} Confirmed</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">Order updates will be sent to <strong>{user.email}</strong>. You can follow every step under Track Orders.</p>
              </div>
              <div className="max-w-md mx-auto bg-stone-50 rounded-xl p-5 border border-stone-200 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-500">Estimated Delivery</span><span className="font-bold text-stone-900">{createdOrder.estimatedDelivery}</span></div>
                <div className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-500">Tracking Number</span><span className="font-semibold text-stone-900">Assigned when your parcel ships</span></div>
                <div className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-500">Shipping To</span><span className="font-semibold text-stone-900 text-right">{createdOrder.shippingAddress.fullName}<br />{createdOrder.shippingAddress.street}, {createdOrder.shippingAddress.city}</span></div>
                <div className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-500">Payment</span><span className="font-semibold text-stone-900">{createdOrder.paymentMethod}</span></div>
                {createdOrder.giftOption?.isGift && <div className="flex justify-between border-b border-stone-200 pb-2 text-amber-900"><span>Gift Presentation</span><span className="font-semibold">{createdOrder.giftOption.giftWrapType}</span></div>}
                <div className="flex justify-between pt-1 font-bold text-stone-950"><span>Total</span><span>{formatPrice(createdOrder.total)}</span></div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button onClick={() => { close(); openOrderTracking(createdOrder.orderNumber); }} className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 flex items-center justify-center gap-2"><Truck className="w-4 h-4" /><span>Track Order</span></button>
                <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-2.5 border border-stone-300 text-stone-700 hover:text-stone-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-50"><Download className="w-4 h-4" /><span>Print Receipt</span></button>
                <button onClick={close} className="w-full sm:w-auto px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold">Continue Shopping</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
