import React, { useState } from 'react';
import { Mail, Check, ArrowRight, ShieldCheck, RefreshCw, Award, HeartHandshake } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const Footer: React.FC = () => {
  const { 
    setCategory, 
    setIsAdminOpen, 
    isStaff,
    openOrderTracking, 
    openAIStudio, 
    setIsBeautyInsiderOpen,
    openStoreLocator 
  } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true); setSubscribeError(null);
    try {
      await api('/newsletter', { body: { email: email.trim() } });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setSubscribeError(errorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 border-b border-stone-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Authentic Beauty</h4>
              <p className="text-xs text-stone-400 mt-1">Direct from authorized luxury beauty houses and verified brands.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Free Returns & Exchanges</h4>
              <p className="text-xs text-stone-400 mt-1">30 days to test in person. Free prepaid returns on every order.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Deluxe Beauty Samples</h4>
              <p className="text-xs text-stone-400 mt-1">Choose 2 luxury mini samples on all orders over $50 at checkout.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">AI Shade Match Studio</h4>
              <p className="text-xs text-stone-400 mt-1">Powered by intelligent skin analysis for exact foundation matches.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-[0.2em] text-white uppercase">
              SAYPHORA
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Receive private invitations to VIP sales, personalized beauty recommendations, and our coveted seasonal beauty edit.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="bg-stone-900 border border-stone-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 flex-1"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-stone-100 hover:bg-white text-stone-950 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribeError && <div role="alert" className="text-xs text-red-400 pt-1">{subscribeError}</div>}
              {subscribed && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                  <Check className="w-4 h-4" />
                  <span>Thank you for subscribing.</span>
                </div>
              )}
            </form>

            <div className="pt-2 flex flex-col gap-2">
              <PWAInstallButton variant="footer" />

              {isStaff && (<button
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-semibold text-amber-300 transition-colors w-fit"
                title="Open Store Operations & Executive Admin Console"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Store Admin Portal</span>
                <span className="text-[9px] bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-200">Executive</span>
              </button>)}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <h5 className="font-semibold text-white uppercase tracking-wider mb-4">
                Shop Department
              </h5>
              <ul className="space-y-2.5 text-stone-400">
                <li><button onClick={() => setCategory('Makeup')} className="hover:text-white transition-colors">Makeup & Cosmetics</button></li>
                <li><button onClick={() => setCategory('Skincare')} className="hover:text-white transition-colors">Skincare & Treatments</button></li>
                <li><button onClick={() => setCategory('Fragrance')} className="hover:text-white transition-colors">Luxury Fragrance</button></li>
                <li><button onClick={() => setCategory('Haircare')} className="hover:text-white transition-colors">Hair Styling & Care</button></li>
                <li><button onClick={() => setCategory('Bath & Body')} className="hover:text-white transition-colors">Bath & Body Care</button></li>
                <li><button onClick={() => setCategory('Clean Beauty')} className="hover:text-white transition-colors">Clean at Sayphora</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white uppercase tracking-wider mb-4">
                Beauty Services
              </h5>
              <ul className="space-y-2.5 text-stone-400">
                <li><button onClick={() => openAIStudio('shade')} className="hover:text-white transition-colors text-left">AI Shade Matching Studio</button></li>
                <li><button onClick={() => openAIStudio('routine')} className="hover:text-white transition-colors text-left">Custom Skincare Regimen</button></li>
                <li><button onClick={() => openAIStudio('chat')} className="hover:text-white transition-colors text-left">Virtual Beauty Consultations</button></li>
                <li><button onClick={() => setIsBeautyInsiderOpen(true)} className="hover:text-white transition-colors text-left">Beauty Insider Rewards Bazaar</button></li>
                <li><button onClick={() => setIsAdminOpen(true)} className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 font-medium text-amber-400"><ShieldCheck className="w-3.5 h-3.5" /> Operations & Inventory Suite</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white uppercase tracking-wider mb-4">
                Client Service
              </h5>
              <ul className="space-y-2.5 text-stone-400">
                <li><button onClick={() => openStoreLocator()} className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 font-medium text-amber-300/90">Find Ateliers & Stores (Google Maps)</button></li>
                <li><button onClick={() => openOrderTracking()} className="hover:text-white transition-colors text-left">Track Your Package</button></li>
                <li><button onClick={() => setIsBeautyInsiderOpen(true)} className="hover:text-white transition-colors text-left">VIP Rewards & Tier Status</button></li>
                <li><button onClick={() => openAIStudio('chat')} className="hover:text-white transition-colors text-left">VIP Concierge Support</button></li>
                <li><button onClick={() => setIsAdminOpen(true)} className="hover:text-amber-300 text-stone-400 transition-colors text-left">Executive Admin Suite</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
        <div>
          © 2026 Sayphora Beauty Inc. All rights reserved. Crafted for elegance, skin health, and timeless confidence.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-stone-300 transition-colors">CA Supply Chains Act</a>
          <a href="#" className="hover:text-stone-300 transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};
