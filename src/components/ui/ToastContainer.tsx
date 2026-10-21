import React from 'react';
import { X, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 bg-stone-950 text-white rounded-xl shadow-2xl border border-stone-800 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-full bg-stone-900 text-amber-300 shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
            </div>

            <div className="min-w-0">
              <h5 className="text-xs font-semibold text-white tracking-wide">{toast.title}</h5>
              {toast.description && (
                <p className="text-[11px] text-stone-300 mt-0.5 leading-normal">{toast.description}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-500 hover:text-white p-0.5 transition-colors shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
