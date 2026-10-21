import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  Gift, 
  Crown, 
  Award, 
  Check, 
  ChevronRight,
  Heart,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BeautyInsiderModal: React.FC = () => {
  const {
    user,
    isBeautyInsiderOpen,
    setIsBeautyInsiderOpen,
    redeemReward,
    rewards,
    redemptions,
    loadRewards,
    setAuthMode,
    setIsAuthModalOpen
  } = useApp();

  const [redeemedNotice, setRedeemedNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { if (isBeautyInsiderOpen && user) loadRewards(); }, [isBeautyInsiderOpen, user?.id, loadRewards]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isBeautyInsiderOpen) return null;

  const currentTier = user?.tier || 'Insider';
  const points = user?.points || 0;
  const pointsToNext = user?.pointsToNextTier ?? 350;
  const nextTierName = currentTier === 'Insider' ? 'VIB' : 'Rouge';
  const nextTierSpend = currentTier === 'Insider' ? 350 : 1000;

  const handleRedeem = async (id: string) => {
    setBusyId(id);
    const r = await redeemReward(id);
    setBusyId(null);
    if (r) setRedeemedNotice(`Redeemed ${r.title}! Your single-use code is ${r.code} — enter it at checkout.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header with VIP Gold Accent */}
        <div className="p-6 bg-linear-to-r from-stone-950 via-stone-900 to-stone-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-stone-950 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                Sayphora Rewards Program
              </div>
              <h2 className="font-serif text-xl font-bold tracking-wide">
                Beauty Insider Club
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsBeautyInsiderOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {/* User Status Card */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Current Membership</span>
                <div className="text-xl font-serif font-bold text-stone-950 flex items-center gap-2">
                  <span>{currentTier} Member</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-sans font-bold">
                    Active
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Rewards Balance</span>
                <div className="text-2xl font-bold text-amber-700">
                  {points} <span className="text-xs font-medium text-stone-500">pts</span>
                </div>
              </div>
            </div>

            {/* Progress to Rouge */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200">
              <div className="flex justify-between text-xs text-stone-600">
                <span>{currentTier === 'Rouge' ? <strong>You have reached our top tier</strong> : <>Progress to <strong>{nextTierName} Tier</strong></>}</span>
                <span>{currentTier === 'Rouge' ? 'Free shipping on every order' : `$${pointsToNext} more spent to reach ${nextTierName}`}</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-stone-950 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentTier === 'Rouge' ? 100 : Math.min(100, Math.max(4, ((nextTierSpend - pointsToNext) / nextTierSpend) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                <span>Insider ($0)</span>
                <span>VIB ($350)</span>
                <span>Rouge ($1,000)</span>
              </div>
            </div>
          </div>

          {redeemedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{redeemedNotice}</span>
            </div>
          )}

          {!user && (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-600 flex items-center justify-between gap-3">
              <span>Sign in to see your balance and redeem rewards.</span>
              <button onClick={() => { setIsBeautyInsiderOpen(false); setAuthMode('signin'); setIsAuthModalOpen(true); }} className="px-4 py-2 bg-stone-950 text-white rounded-lg font-semibold">Sign In</button>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">How membership works</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                ['Earn 1 Pt / $1 Spent', 'Points are earned on your order total after discounts, and credited when your order is placed.'],
                ['Tiers by lifetime spend', 'VIB unlocks at $350 and Rouge at $1,000 of lifetime spend.'],
                ['Rouge: Free Shipping', 'Rouge members enjoy complimentary shipping on every order, plus Rouge-only promotions.']
              ].map(([t, d]) => (
                <div key={t} className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>{t}</span></div>
                  <p className="text-[11px] text-stone-500">{d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Rewards Bazaar (Redeem with Points)</h4>
            <div className="space-y-3">
              {rewards.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-stone-200 flex items-center justify-between gap-4 hover:border-stone-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">{r.costPoints}</div>
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{r.title}</div>
                      <div className="text-[11px] text-stone-500">{r.costPoints} Points · ${r.value} credit · single-use code</div>
                    </div>
                  </div>
                  <button onClick={() => handleRedeem(r.id)} disabled={!user || points < r.costPoints || busyId === r.id}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-950 hover:bg-stone-800 text-white disabled:opacity-40 transition-colors">
                    {busyId === r.id ? '…' : 'Redeem'}
                  </button>
                </div>
              ))}
              {user && rewards.length === 0 && <p className="text-xs text-stone-400">No rewards are available right now.</p>}
            </div>
          </div>

          {redemptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Your reward codes</h4>
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <div><span className="font-mono font-bold text-stone-900">{r.code}</span><span className="text-stone-500"> · {r.title}</span></div>
                  <span className={r.used ? 'text-stone-400' : 'text-emerald-700 font-semibold'}>{r.used ? 'Used' : 'Available'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
