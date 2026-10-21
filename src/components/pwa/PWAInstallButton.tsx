import React, { useState } from 'react';
import { Download, Sparkles, X, Share, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'footer' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running standalone or installed, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'footer') {
      return (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-2 px-3 py-2 bg-stone-900 hover:bg-stone-850 border border-amber-400/30 rounded-lg text-xs font-semibold text-amber-300 transition-colors ${className}`}
          title="Install Sayphora as a standalone desktop or mobile application"
        >
          {installSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          <span>{installSuccess ? 'App Installed!' : 'Install Sayphora App'}</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-full shadow-2xs transition-colors ${className}`}
        title="Install Sayphora for instant offline access"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{installSuccess ? 'Installed' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-300 hover:text-white transition-colors ${className}`}
          title="Add to Home Screen on iOS"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Add to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 text-stone-200 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                    S
                  </div>
                  <h3 className="font-serif font-bold text-base text-white">Install on iOS Safari</h3>
                </div>
                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                Experience Sayphora with instant offline access and native fullscreen luxury:
              </p>

              <ol className="text-xs space-y-2.5 text-stone-300 list-decimal list-inside bg-stone-950 p-4 rounded-xl border border-stone-800">
                <li className="flex items-start gap-2">
                  <Share className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Tap the <strong>Share button</strong> in Safari's bottom toolbar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <PlusSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tap <strong>Add</strong> in the top-right corner.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
