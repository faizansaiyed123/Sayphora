import React, { useEffect, useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError, errorMessage } from '../../lib/api';

const inputCls =
  'w-full text-xs pl-9 pr-3 py-2.5 border rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-900';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, resetToken,
    login, register, forgotPassword, resetPassword
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  // Start every visit/mode with a clean slate (but keep the typed email for convenience).
  useEffect(() => { setError(null); setFieldErrors({}); setNotice(null); setPassword(''); }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const close = () => setIsAuthModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null); setFieldErrors({}); setNotice(null);
    try {
      if (authMode === 'signin') await login(email.trim(), password);
      else if (authMode === 'signup') await register(name.trim(), email.trim(), password);
      else if (authMode === 'forgot') setNotice(await forgotPassword(email.trim()));
      else if (authMode === 'reset' && resetToken) {
        await resetPassword(resetToken, password);
        setAuthMode('signin');
        setNotice('Your password was updated. Sign in with the new password.');
      }
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && err.fields) setFieldErrors(err.fields);
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<typeof authMode, string> = {
    signin: 'Sign In to Account',
    signup: 'Create Free Account & Earn 50 Pts',
    forgot: 'Email Me a Reset Link',
    reset: 'Save New Password'
  };
  const showTabs = authMode === 'signin' || authMode === 'signup';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or create an account"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col">
        <div className="p-6 text-center border-b border-stone-200 bg-stone-50/50 relative">
          <button onClick={close} aria-label="Close" className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <span className="font-serif text-2xl font-bold tracking-[0.2em] text-stone-950 uppercase block">SAYPHORA</span>
          <span className="text-[10px] uppercase tracking-widest text-stone-500 font-sans mt-0.5 block">Beauty Insider Portal</span>
        </div>

        {showTabs && (
          <div className="flex border-b border-stone-200 text-xs font-semibold uppercase tracking-wider" role="tablist">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={authMode === m}
                onClick={() => setAuthMode(m)}
                className={`flex-1 py-3 border-b-2 transition-colors ${authMode === m ? 'border-stone-950 text-stone-950 font-bold' : 'border-transparent text-stone-400 hover:text-stone-700'}`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4">
          {authMode === 'forgot' && <p className="text-xs text-stone-600">Enter the email for your account and we will send you a link to choose a new password.</p>}
          {authMode === 'reset' && <p className="text-xs text-stone-600">Choose a new password for your account.</p>}

          {notice && (
            <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <span>{notice}</span>
            </div>
          )}
          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-800">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {authMode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <input id="auth-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sophia Laurent" required aria-invalid={!!fieldErrors.name} className={`${inputCls} ${fieldErrors.name ? 'border-red-400' : 'border-stone-200'}`} />
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>
            )}

            {authMode !== 'reset' && (
              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required aria-invalid={!!fieldErrors.email} className={`${inputCls} ${fieldErrors.email ? 'border-red-400' : 'border-stone-200'}`} />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
            )}

            {authMode !== 'forgot' && (
              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-stone-700 mb-1">{authMode === 'reset' ? 'New Password' : 'Password'}</label>
                <div className="relative">
                  <input id="auth-password" type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" required minLength={authMode === 'signin' ? undefined : 10} aria-invalid={!!fieldErrors.password} className={`${inputCls} ${fieldErrors.password ? 'border-red-400' : 'border-stone-200'}`} />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {(authMode === 'signup' || authMode === 'reset') && <p className={`text-[11px] mt-1 ${fieldErrors.password ? 'text-red-600' : 'text-stone-400'}`}>{fieldErrors.password ?? 'At least 10 characters.'}</p>}
              </div>
            )}

            <button type="submit" disabled={busy} className="w-full py-3 bg-stone-950 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{busy ? 'Please wait…' : titles[authMode]}</span>
              {!busy && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {authMode === 'signin' && (
            <button type="button" onClick={() => setAuthMode('forgot')} className="block mx-auto text-[11px] font-semibold text-stone-500 hover:text-stone-900 underline underline-offset-2">
              Forgot your password?
            </button>
          )}
          {(authMode === 'forgot' || authMode === 'reset') && (
            <button type="button" onClick={() => setAuthMode('signin')} className="block mx-auto text-[11px] font-semibold text-stone-500 hover:text-stone-900 underline underline-offset-2">
              ← Back to sign in
            </button>
          )}

          <div className="text-center text-[11px] text-stone-400 pt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span>Passwords are salted and hashed; sessions use secure cookies</span>
          </div>
        </div>
      </div>
    </div>
  );
};
