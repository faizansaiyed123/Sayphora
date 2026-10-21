import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Sparkles, Check, Database } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isReconnecting, wasOffline, checkConnection } = useNetworkStatus();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // When offline, ensure banner is visible again
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (showRestoredNotice) {
    return (
      <aside aria-label="Network status notification" className="bg-emerald-950 text-emerald-200 text-xs py-2 px-4 border-b border-emerald-800 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Connection Restored</span>
            <span className="text-emerald-300/80 hidden sm:inline">· Live inventory, stock sync, and AI features are fully operational.</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
        </div>
      </aside>
    );
  }

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <aside aria-label="Offline mode notification" className="bg-amber-950/95 text-amber-100 text-xs py-2 px-4 border-b border-amber-800/80 transition-all duration-300 animate-in fade-in slide-in-from-top-2 sticky top-0 z-50 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <WifiOff className="w-3 h-3 text-amber-400" />
          </div>
          <div>
            <div className="font-semibold flex items-center gap-1.5 text-white">
              <span>Offline Mode Active</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">Service Worker Active</span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Critical assets and product data are cached. You can continue inspecting beauty items and building your bag.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => checkConnection()}
            disabled={isReconnecting}
            className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-850 text-amber-200 text-[11px] font-semibold flex items-center gap-1.5 border border-amber-700/60 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Checking...' : 'Check Connection'}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="text-[11px] text-amber-300 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
};
