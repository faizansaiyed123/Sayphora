import React from 'react';
import { Crown, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BeautyInsiderBanner: React.FC = () => {
  const { user, setIsBeautyInsiderOpen, setIsAuthModalOpen, setAuthMode } = useApp();

  return (
    <section className="bg-linear-to-r from-stone-900 via-stone-850 to-stone-900 text-white py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Sayphora Beauty Insider Club</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Unlock Exclusive Rewards, Birthday Gifts & Private Sales
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Earn 1 point for every dollar spent. Redeem points for luxury trial miniatures, full-size icons, or $10 off certificates. Plus, enjoy complimentary deluxe samples with every parcel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {user ? (
              <button
                onClick={() => setIsBeautyInsiderOpen(true)}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-full text-xs tracking-wide flex items-center gap-2 shadow-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>View My Rewards ({user.points} pts)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-full text-xs tracking-wide flex items-center gap-2 shadow-lg transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  <span>Join for Free & Get 50 Bonus Points</span>
                </button>

                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full text-xs transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
