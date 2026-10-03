import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { isValidEmail, isValidPhone, formatPhoneNumber } from '../utils/helpers';
import { api } from '../utils/api';

export default function AuthModal({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time validation feedback
  const cleanPhone = phone.replace(/\D/g, '');
  const emailValid = email.length > 0 ? isValidEmail(email) : null;
  const phoneValid = cleanPhone.length > 0 ? cleanPhone.length === 10 : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email.trim()) {
        setError('Please enter your email or phone number');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address (e.g. name@domain.com)');
        return;
      }
      if (!isValidPhone(cleanPhone)) {
        setError(`Phone number must contain exactly 10 digits (currently ${cleanPhone.length})`);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await api.login(email, password);
      } else {
        res = await api.signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          password
        });
      }
      if (res && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.login('demo@finishtoday.com', 'demo1234');
      onAuthSuccess(res.user);
    } catch {
      // Direct demo fallback
      const demoUser = {
        id: 'demo_user_1',
        name: 'Alex Johnson',
        email: 'alex@finishtoday.com',
        phone: '9876543210',
        nightReminderTime: '21:00',
        reminderLeadMinutes: 10
      };
      localStorage.setItem('finishtoday_user', JSON.stringify(demoUser));
      onAuthSuccess(demoUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-8 overflow-hidden rounded-2xl glass-panel glass-panel-glow border border-indigo-500/20 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30 mb-3 animate-float">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Clock className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            FinishToday
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'Welcome back! Sign in to master your daily agenda.' : 'Create your account with email & phone verification.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 mb-6 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">
                {isLogin ? 'Email or Phone Number' : 'Email Address'}
              </label>
              {!isLogin && email.length > 0 && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${emailValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {emailValid ? (
                    <><CheckCircle2 className="w-3 h-3" /> Valid Email Format</>
                  ) : (
                    <><AlertCircle className="w-3 h-3" /> Invalid Email Format</>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={isLogin ? 'text' : 'email'}
                required
                placeholder={isLogin ? 'user@example.com or 10-digit phone' : 'name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all ${
                  !isLogin && email.length > 0
                    ? emailValid 
                      ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                      : 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Phone Number
                </label>
                {phone.length > 0 && (
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${phoneValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {phoneValid ? (
                      <><CheckCircle2 className="w-3 h-3" /> Valid (10 Digits)</>
                    ) : (
                      <span>{cleanPhone.length}/10 digits</span>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={14}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all ${
                    phone.length > 0
                      ? phoneValid 
                        ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                        : 'border-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Must be exactly 10 numeric digits. Used for reminders & secure login.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to FinishToday' : 'Register & Start Organizing'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Access */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Demo Account (Instant Access)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
