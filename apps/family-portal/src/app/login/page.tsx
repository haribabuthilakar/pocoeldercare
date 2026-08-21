'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Phone, Mail, Lock, ShieldCheck, ArrowRight, Sparkles, HeartHandshake } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithOtp, sendOtp } = useAuth();
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');

  // OTP State
  const [phone, setPhone] = useState('+919845023456');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>('123456');

  // Email State
  const [email, setEmail] = useState('vikram.menon@gmail.com');
  const [password, setPassword] = useState('PocoCare@2026');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setOtpSent(true);
      if (res?.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtp(res.devOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(phone, otp);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edfaf5] via-[#f8fbfb] to-[#fee5f2] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Floating Glowing Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#12C395]/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FE1D8F]/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full glass-card rounded-3xl shadow-2xl border border-white/80 overflow-hidden relative z-10 animate-glow">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0b0f19] to-[#151b28] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#12C395]/15 to-[#FE1D8F]/15 opacity-50" />
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#12C395] to-[#FE1D8F] items-center justify-center mb-3 shadow-lg glow-primary animate-float">
            <span className="font-black text-3xl text-white">P</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Pococare Family Portal</h1>
          <p className="text-slate-300 text-xs font-medium mt-1 flex items-center justify-center space-x-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#12C395]" />
            <span>Uncompromising peace of mind for your parents</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/60 p-2 bg-slate-100/50">
          <button
            onClick={() => { setAuthMethod('otp'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-2 rounded-xl transition-all duration-300 ${
              authMethod === 'otp'
                ? 'bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white shadow-md glow-primary'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
          <button
            onClick={() => { setAuthMethod('email'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-2 rounded-xl transition-all duration-300 ${
              authMethod === 'email'
                ? 'bg-gradient-to-r from-[#FE1D8F] to-[#e40974] text-white shadow-md glow-secondary'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Login (NRI)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {authMethod === 'otp' ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919845023456"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395] transition"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg glow-primary hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{loading ? 'Sending OTP...' : 'Get Instant OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="p-3 bg-[#edfaf5] border border-[#12C395]/30 rounded-2xl text-xs text-[#0e5443] flex items-center justify-between font-medium">
                  <span>OTP sent to {phone}</span>
                  {devOtpHint && (
                    <span className="font-bold px-2 py-0.5 bg-[#12C395] text-white rounded-lg">
                      Dev: {devOtpHint}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full text-center tracking-widest text-2xl py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg glow-primary hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Portal'}</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-xs text-slate-500 hover:text-slate-800 font-medium mt-1"
                >
                  Change phone number
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram.menon@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE1D8F] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE1D8F] transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#FE1D8F] to-[#e40974] hover:brightness-110 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg glow-secondary hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Family Member'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
