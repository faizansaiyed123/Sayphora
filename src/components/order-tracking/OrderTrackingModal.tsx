import React, { useEffect, useState } from 'react';
import { X, Package, Truck, CheckCircle2, MapPin, Search, Box, Home, XCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { ORDER_STATUS_FLOW } from '../../../shared/commerce';

const STEPS = [
  { status: 'Processing', label: 'Order Placed', icon: Package },
  { status: 'Packed', label: 'Packed', icon: Box },
  { status: 'Shipped', label: 'Shipped', icon: Truck },
  { status: 'In Transit', label: 'In Transit', icon: MapPin },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: Home }
] as const;

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');

export const OrderTrackingModal: React.FC = () => {
  const { isOrderTrackingOpen, closeOrderTracking, orders, trackedOrderNumber, formatPrice, cancelOrder, user } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isOrderTrackingOpen) return;
    setQuery(trackedOrderNumber);
    setNotFound(false);
  }, [isOrderTrackingOpen, trackedOrderNumber]);

  // Keep the selection in sync with freshly loaded orders.
  useEffect(() => {
    if (!isOrderTrackingOpen) return;
    const wanted = trackedOrderNumber || orders[0]?.orderNumber;
    setSelected((cur) => orders.find((o) => o.id === cur?.id) ?? orders.find((o) => o.orderNumber === wanted) ?? null);
  }, [orders, isOrderTrackingOpen, trackedOrderNumber]);

  if (!isOrderTrackingOpen) return null;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase().replace(/^#/, '');
    const found = orders.find((o) => o.orderNumber.toUpperCase() === q || o.orderNumber.toUpperCase() === `SAY-${q}`);
    setSelected(found ?? null);
    setNotFound(!found);
  };

  const eventAt = (o: Order, status: string) => o.events.find((e) => e.status === status)?.at;
  const idx = (o: Order) => ORDER_STATUS_FLOW.indexOf(o.status as (typeof ORDER_STATUS_FLOW)[number]);
  const canCancel = (o: Order) => o.status === 'Processing' && o.paymentStatus !== 'Paid';

  const handleCancel = async (o: Order) => {
    if (!window.confirm(`Cancel order ${o.orderNumber}? This cannot be undone.`)) return;
    setCancelling(true);
    await cancelOrder(o.id);
    setCancelling(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Track your order" className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && closeOrderTracking()}>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-stone-700" /><span className="font-serif text-lg font-bold text-stone-950">Order Tracking</span></div>
          <button onClick={closeOrderTracking} aria-label="Close" className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <form onSubmit={search} className="flex gap-2">
            <div className="relative flex-1">
              <input aria-label="Order number" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Order number, e.g. SAY-10001" className="w-full text-xs pl-9 pr-3 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-900" />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-800">Find</button>
          </form>

          {orders.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {orders.map((o) => (
                <button key={o.id} onClick={() => { setSelected(o); setQuery(o.orderNumber); setNotFound(false); }}
                  className={`text-[11px] px-3 py-1.5 rounded-full border ${selected?.id === o.id ? 'bg-stone-950 text-white border-stone-950' : 'border-stone-200 text-stone-600 hover:border-stone-900'}`}>
                  {o.orderNumber} · {o.status}
                </button>
              ))}
            </div>
          )}

          {notFound && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">No order with that number was found in {user?.email ?? 'your account'}.</div>}
          {!selected && !notFound && (
            <div className="text-center py-10 text-xs text-stone-500">{orders.length === 0 ? 'You have not placed any orders yet.' : 'Enter an order number to see its progress.'}</div>
          )}

          {selected && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">Order</div>
                  <div className="text-lg font-serif font-bold text-stone-950">{selected.orderNumber}</div>
                  <div className="text-[11px] text-stone-500">Placed {selected.date}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${selected.status === 'Cancelled' ? 'bg-red-100 text-red-800' : selected.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{selected.status}</span>
                  <div className="text-[11px] text-stone-500 mt-1">Payment: {selected.paymentStatus}</div>
                </div>
              </div>

              {selected.status === 'Cancelled' ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-800"><XCircle className="w-5 h-5 shrink-0" /> This order was cancelled{eventAt(selected, 'Cancelled') ? ` on ${fmt(eventAt(selected, 'Cancelled'))}` : ''}. Items were returned to stock.</div>
              ) : (
                <ol className="space-y-0" aria-label="Order progress">
                  {STEPS.map((s, i) => {
                    const done = i <= idx(selected);
                    const current = i === idx(selected);
                    const at = eventAt(selected, s.status);
                    const Icon = s.icon;
                    return (
                      <li key={s.status} className="flex gap-3" aria-current={current ? 'step' : undefined}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? 'bg-stone-950 border-stone-950 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>{done && !current ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}</div>
                          {i < STEPS.length - 1 && <div className={`w-0.5 h-7 ${i < idx(selected) ? 'bg-stone-950' : 'bg-stone-200'}`} />}
                        </div>
                        <div className="pb-5 pt-1">
                          <div className={`text-xs font-bold ${done ? 'text-stone-950' : 'text-stone-400'}`}>{s.label}</div>
                          <div className="text-[11px] text-stone-500">{at ? fmt(at) : done ? '' : 'Pending'}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200"><div className="text-stone-400 text-[10px] uppercase font-semibold">Est. delivery</div><div className="font-bold text-stone-900 mt-0.5">{selected.estimatedDelivery || '—'}</div></div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200"><div className="text-stone-400 text-[10px] uppercase font-semibold">Tracking</div><div className="font-bold text-stone-900 mt-0.5 break-all">{selected.trackingNumber ? `${selected.carrier ?? ''} ${selected.trackingNumber}` : <span className="inline-flex items-center gap-1 text-stone-500 font-medium"><Clock className="w-3 h-3" /> Assigned on dispatch</span>}</div></div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200"><div className="text-stone-400 text-[10px] uppercase font-semibold">Method</div><div className="font-bold text-stone-900 mt-0.5">{selected.shippingMethod}</div></div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">Items</div>
                {selected.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-stone-900 truncate">{item.name}</div>
                      <div className="text-stone-500 text-[11px]">{item.shadeName ? `${item.shadeName} · ` : ''}Qty {item.quantity}</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatPrice(item.unitPrice * item.quantity)}</div>
                  </div>
                ))}
                {selected.samples.length > 0 && <div className="text-[11px] text-stone-500">+ {selected.samples.length} complimentary sample(s)</div>}
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-950"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
              </div>

              <div className="text-xs text-stone-600 p-3 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900 mb-0.5">Shipping to</div>
                {selected.shippingAddress.fullName} · {selected.shippingAddress.street}, {selected.shippingAddress.city} {selected.shippingAddress.zipCode}, {selected.shippingAddress.country}
              </div>

              {canCancel(selected) && (
                <button onClick={() => handleCancel(selected)} disabled={cancelling} className="w-full py-2.5 border border-red-300 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-50 disabled:opacity-60">
                  {cancelling ? 'Cancelling…' : 'Cancel this order'}
                </button>
              )}
              {!canCancel(selected) && selected.status !== 'Cancelled' && selected.status !== 'Delivered' && (
                <p className="text-[11px] text-stone-400 text-center">Orders can be cancelled online until they are packed. After that, please contact support.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
