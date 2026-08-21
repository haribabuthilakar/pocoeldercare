const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Updated:', relPath);
}

// -------------------------------------------------------------
// 1. TAILWIND CONFIG & GLOBALS CSS
// -------------------------------------------------------------

writeFile('apps/family-portal/tailwind.config.ts', `
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', '-apple-system', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#edfaf5',
          100: '#d4f4ea',
          200: '#aee8d7',
          300: '#77d7be',
          400: '#3ec0a2',
          500: '#12C395', // Primary Color
          600: '#0ba17a',
          700: '#0c8063',
          800: '#0e6651',
          900: '#0e5443',
        },
        secondary: {
          50: '#fef1f8',
          100: '#fee5f2',
          200: '#fecee6',
          300: '#fda6d2',
          400: '#fb6eb6',
          500: '#FE1D8F', // Secondary Color
          600: '#e40974',
          700: '#bf035b',
          800: '#9e064c',
          900: '#830a43',
        },
        navy: {
          800: '#151b28',
          900: '#0b0f19',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(18, 195, 149, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(254, 29, 143, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
`);

writeFile('apps/family-portal/src/app/globals.css', `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #12C395;
  --secondary: #FE1D8F;
  --background: #f8fbfb;
  --foreground: #0b0f19;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  overflow-x: hidden;
}

/* Custom glow utility classes */
.glow-primary {
  box-shadow: 0 4px 20px -2px rgba(18, 195, 149, 0.35);
}

.glow-secondary {
  box-shadow: 0 4px 20px -2px rgba(254, 29, 143, 0.35);
}

.glow-dual {
  box-shadow: 0 8px 30px -4px rgba(18, 195, 149, 0.25), 0 4px 20px -2px rgba(254, 29, 143, 0.2);
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.gradient-text {
  background: linear-gradient(135deg, #12C395 0%, #FE1D8F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`);

writeFile('apps/family-portal/src/app/layout.tsx', `
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Pococare Family Portal | Elder Care Peace of Mind',
  description: 'Track vitals, manage appointments, and stay connected with dedicated care officers in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fbfb] text-slate-900 font-sans antialiased selection:bg-[#FE1D8F]/20 selection:text-[#FE1D8F]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
`);

// -------------------------------------------------------------
// 2. HEADER & NAVIGATION WITH VIBRANT ANIMATIONS
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/layout/portal-header.tsx', `
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { HeartPulse, Calendar, Layers, Wallet, Sparkles, LogOut, ShieldAlert, ChevronDown } from 'lucide-react';

export const PortalHeader: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, activeHouseholdName, setActiveHousehold } = useAuth();

  const navLinks = [
    { href: '/dashboard', label: 'Vitals & Health', icon: HeartPulse },
    { href: '/calendar', label: 'Dual-Time Calendar', icon: Calendar },
    { href: '/services', label: '90-Service Catalog', icon: Layers },
    { href: '/wallet', label: 'INR Wallet', icon: Wallet },
    { href: '/digest', label: 'Monthly Value Digest', icon: Sparkles },
  ];

  return (
    <header className="glass-card border-b border-slate-200/80 sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Brand with Gradient Accent */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#12C395] to-[#FE1D8F] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg glow-primary group-hover:scale-105 transition-all duration-300">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">Poco<span className="text-[#12C395]">care</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#12C395]/15 to-[#FE1D8F]/15 text-[#0ba17a] border border-[#12C395]/30">
                  Family Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Uncompromising Care for Elders</p>
            </div>
          </Link>

          {/* Multi-Household Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            <span className="text-xs text-slate-500 font-semibold px-2">Household:</span>
            <div className="relative">
              <select
                value={activeHouseholdName?.includes('Bangalore') ? 'hh-blr-001' : 'hh-hyd-002'}
                onChange={(e) => {
                  if (e.target.value === 'hh-blr-001') {
                    setActiveHousehold('hh-blr-001', 'Menon Residence (Bangalore)');
                  } else {
                    setActiveHousehold('hh-hyd-002', 'Varma Villa (Hyderabad)');
                  }
                }}
                className="text-xs font-bold bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#12C395] cursor-pointer shadow-sm transition appearance-none"
              >
                <option value="hh-blr-001">Menon Residence (Bangalore)</option>
                <option value="hh-hyd-002">Varma Villa (Hyderabad)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 24x7 Helpline Indicator & User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-[#FE1D8F]/10 to-[#FE1D8F]/5 text-[#FE1D8F] border border-[#FE1D8F]/30 rounded-full text-xs font-bold shadow-sm animate-pulse-slow">
              <ShieldAlert className="w-4 h-4 text-[#FE1D8F]" />
              <span>24x7 Emergency Line Active</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3 bg-white p-1.5 pl-3 pr-2 rounded-2xl border border-slate-200/70 shadow-sm">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">NRI Family</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#12C395] to-[#0ba17a] text-white flex items-center justify-center text-xs font-bold shadow">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-[#FE1D8F] hover:bg-[#FE1D8F]/10 rounded-xl transition duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white hover:brightness-105 shadow-md glow-primary transition duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-2 sm:space-x-4 -mb-px overflow-x-auto pb-2 scrollbar-none">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={\`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 \${
                  isActive
                    ? 'bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white shadow-md glow-primary scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }\`}
              >
                <Icon className={\`w-4 h-4 \${isActive ? 'text-white animate-bounce' : 'text-slate-400'}\`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
`);

// -------------------------------------------------------------
// 3. LOGIN PAGE WITH VIBRANT NEOMORPHISM & PARTICLES
// -------------------------------------------------------------

writeFile('apps/family-portal/src/app/login/page.tsx', `
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
            className={\`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-2 rounded-xl transition-all duration-300 \${
              authMethod === 'otp'
                ? 'bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white shadow-md glow-primary'
                : 'text-slate-600 hover:text-slate-900'
            }\`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
          <button
            onClick={() => { setAuthMethod('email'); setError(null); }}
            className={\`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-2 rounded-xl transition-all duration-300 \${
              authMethod === 'email'
                ? 'bg-gradient-to-r from-[#FE1D8F] to-[#e40974] text-white shadow-md glow-secondary'
                : 'text-slate-600 hover:text-slate-900'
            }\`}
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
`);

// -------------------------------------------------------------
// 4. HEALTH SUMMARY BADGE & VITALS CHART WITH VIBRANT PALETTE
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/vitals/health-summary-badge.tsx', `
import React from 'react';
import { CheckCircle2, AlertTriangle, UserCheck, Sparkles, Activity } from 'lucide-react';

interface HealthSummaryBadgeProps {
  status: 'STABLE' | 'NEEDS_ATTENTION' | 'CRITICAL';
  label: string;
  doctorReviewed?: string;
}

export const HealthSummaryBadge: React.FC<HealthSummaryBadgeProps> = ({
  status,
  label,
  doctorReviewed = 'Dr. Anand Kulkarni (MD Geriatrics)',
}) => {
  const config = {
    STABLE: {
      bg: 'bg-gradient-to-r from-[#edfaf5] to-[#d4f4ea]/40',
      border: 'border-[#12C395]/40',
      text: 'text-[#0e5443]',
      badge: 'bg-[#12C395]',
      icon: CheckCircle2,
      glow: 'glow-primary',
    },
    NEEDS_ATTENTION: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-500',
      icon: AlertTriangle,
      glow: 'shadow-md',
    },
    CRITICAL: {
      bg: 'bg-gradient-to-r from-[#fee5f2] to-[#fef1f8]',
      border: 'border-[#FE1D8F]/40',
      text: 'text-[#830a43]',
      badge: 'bg-[#FE1D8F]',
      icon: AlertTriangle,
      glow: 'glow-secondary',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={\`p-5 rounded-3xl border \${config.border} \${config.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300\`}>
      <div className="flex items-center space-x-4">
        <div className={\`w-12 h-12 rounded-2xl \${config.badge} text-white flex items-center justify-center shadow-lg \${config.glow} animate-float\`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className={\`font-extrabold text-base sm:text-lg \${config.text}\`}>{label}</h3>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#12C395] border border-[#12C395]/30 shadow-xs">
              Safe Range
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Geriatric telemetry monitored in real-time by Pococare Clinical Command Center
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 text-xs text-slate-700 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs self-start md:self-auto">
        <UserCheck className="w-4 h-4 text-[#12C395]" />
        <span>Reviewed by <strong className="text-slate-900 font-bold">{doctorReviewed}</strong></span>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/components/vitals/vitals-trend-chart.tsx', `
'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

interface VitalsReading {
  date: string;
  systolicBp: number;
  diastolicBp: number;
  pulseBpm: number;
  spo2Percent: number;
  glucoseFasting?: number;
  glucoseRandom?: number;
  weightKg?: number;
}

interface VitalsTrendChartProps {
  readings?: VitalsReading[];
}

const defaultMockReadings: VitalsReading[] = [
  { date: 'Aug 15', systolicBp: 124, diastolicBp: 80, pulseBpm: 72, spo2Percent: 98, glucoseFasting: 104, weightKg: 68.2 },
  { date: 'Aug 16', systolicBp: 128, diastolicBp: 82, pulseBpm: 74, spo2Percent: 97, glucoseFasting: 108, weightKg: 68.3 },
  { date: 'Aug 17', systolicBp: 122, diastolicBp: 78, pulseBpm: 70, spo2Percent: 98, glucoseFasting: 99, weightKg: 68.1 },
  { date: 'Aug 18', systolicBp: 130, diastolicBp: 84, pulseBpm: 76, spo2Percent: 96, glucoseFasting: 112, weightKg: 68.4 },
  { date: 'Aug 19', systolicBp: 126, diastolicBp: 81, pulseBpm: 73, spo2Percent: 98, glucoseFasting: 102, weightKg: 68.2 },
  { date: 'Aug 20', systolicBp: 125, diastolicBp: 79, pulseBpm: 71, spo2Percent: 99, glucoseFasting: 106, weightKg: 68.0 },
  { date: 'Aug 21', systolicBp: 128, diastolicBp: 82, pulseBpm: 74, spo2Percent: 97, glucoseFasting: 105, weightKg: 68.1 },
];

export const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({
  readings = defaultMockReadings,
}) => {
  const [metric, setMetric] = useState<'bp' | 'spo2' | 'glucose' | 'pulse'>('bp');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Geriatric Vitals Trend</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-[#12C395] animate-ping" />
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automated <strong className="text-[#12C395]">#12C395 safe-zone bands</strong> with continuous clinical telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setMetric('bp')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 \${
                metric === 'bp' ? 'bg-[#12C395] text-white shadow glow-primary' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              BP (mmHg)
            </button>
            <button
              onClick={() => setMetric('spo2')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 \${
                metric === 'spo2' ? 'bg-[#12C395] text-white shadow glow-primary' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              SpO2 (%)
            </button>
            <button
              onClick={() => setMetric('glucose')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 \${
                metric === 'glucose' ? 'bg-[#FE1D8F] text-white shadow glow-secondary' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              Glucose
            </button>
            <button
              onClick={() => setMetric('pulse')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 \${
                metric === 'pulse' ? 'bg-[#FE1D8F] text-white shadow glow-secondary' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              Pulse
            </button>
          </div>

          {/* Timeframe */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={\`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 \${
                  timeframe === tf ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }\`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'bp' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              {/* Geriatric Normal BP Safe Zone: 90 - 140 mmHg systolic */}
              <ReferenceArea y1={90} y2={140} fill="#edfaf5" fillOpacity={0.8} />
              <ReferenceLine y={140} stroke="#12C395" strokeDasharray="3 3" />
              <ReferenceLine y={90} stroke="#12C395" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[60, 160]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #12C395', color: '#fff', fontFamily: 'Poppins' }}
              />
              <Line
                type="monotone"
                dataKey="systolicBp"
                name="Systolic BP"
                stroke="#12C395"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#12C395', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, stroke: '#12C395', strokeWidth: 3 }}
              />
              <Line
                type="monotone"
                dataKey="diastolicBp"
                name="Diastolic BP"
                stroke="#FE1D8F"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FE1D8F', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          ) : metric === 'spo2' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={94} y2={100} fill="#edfaf5" fillOpacity={0.8} />
              <ReferenceLine y={94} stroke="#12C395" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #12C395', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="spo2Percent"
                name="SpO2 %"
                stroke="#12C395"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#12C395', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : metric === 'glucose' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={70} y2={130} fill="#fee5f2" fillOpacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[60, 200]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #FE1D8F', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="glucoseFasting"
                name="Fasting Glucose"
                stroke="#FE1D8F"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#FE1D8F', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={60} y2={90} fill="#fee5f2" fillOpacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[50, 110]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #FE1D8F', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="pulseBpm"
                name="Pulse (BPM)"
                stroke="#FE1D8F"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#FE1D8F', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#12C395] shadow-xs" />
            <span>Primary: #12C395 Safe Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FE1D8F] shadow-xs" />
            <span>Secondary: #FE1D8F Telemetry</span>
          </div>
        </div>
        <span className="text-slate-400">Bluetooth RPM Ingested Today 08:30 AM</span>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 5. DASHBOARD PAGE ENHANCED WITH ANIMATIONS
// -------------------------------------------------------------

writeFile('apps/family-portal/src/app/dashboard/page.tsx', `
'use client';

import React from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { HealthSummaryBadge } from '@/components/vitals/health-summary-badge';
import { VitalsTrendChart } from '@/components/vitals/vitals-trend-chart';
import { NamedCareOfficerCard } from '@/components/care-officer/named-care-officer-card';
import { User, Phone, MapPin, Shield, ArrowUpRight, Heart, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Top Elderly Member Card with Glass Effect */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm mb-6 border border-white hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#12C395] to-[#FE1D8F] p-1 shadow-lg glow-primary animate-float">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center font-black text-2xl text-slate-900">
                  GM
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Gopalakrishnan Menon
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#edfaf5] text-[#0ba17a] border border-[#12C395]/40 shadow-xs flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#12C395] animate-ping" />
                    <span>Sampoorna Care Active</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-[#12C395]" />
                    <span>Age: 79 • Blood Group: O+</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-[#FE1D8F]" />
                    <span>Indiranagar, Bangalore</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-4 h-4 text-[#12C395]" />
                    <span>+91 98450 12345</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Link
                href="/services"
                className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white text-xs font-bold rounded-2xl transition shadow-lg glow-primary flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Book Included Service</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Health Summary Banner */}
        <div className="mb-6">
          <HealthSummaryBadge
            status="STABLE"
            label="Overall Vitals Status: Stable & Well-Controlled"
            doctorReviewed="Dr. Anand Kulkarni (MD Geriatrics)"
          />
        </div>

        {/* Two-Column Grid: Vitals Chart & Care Officer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Vitals */}
          <div className="lg:col-span-2 space-y-6">
            <VitalsTrendChart />

            {/* Quick Metrics with Vibrant Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Blood Pressure</span>
                <div className="text-2xl font-black text-slate-900 mt-1">128/82</div>
                <span className="text-xs text-[#0ba17a] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12C395]" />
                  <span>Normal</span>
                </span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">SpO2 Oxygen</span>
                <div className="text-2xl font-black text-slate-900 mt-1">98%</div>
                <span className="text-xs text-[#0ba17a] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12C395]" />
                  <span>Optimal</span>
                </span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Blood Glucose</span>
                <div className="text-2xl font-black text-[#FE1D8F] mt-1">105</div>
                <span className="text-xs text-[#FE1D8F] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE1D8F]" />
                  <span>Fasting Target</span>
                </span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pulse Rate</span>
                <div className="text-2xl font-black text-slate-900 mt-1">74</div>
                <span className="text-xs text-[#0ba17a] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12C395]" />
                  <span>Resting BPM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Col: Named Care Officer Card & Emergency Readiness */}
          <div className="space-y-6">
            <NamedCareOfficerCard />

            {/* ICE Emergency Card Quick View */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#FE1D8F]" />
                  <span>ICE Emergency Medical Sheet</span>
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#fee5f2] text-[#FE1D8F] border border-[#FE1D8F]/30">
                  < 2s Cache Active
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block">Preferred Hospital:</span>
                  <span>Manipal Hospital Old Airport Rd (+91 80 2502 4444)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/60">
                  <span className="font-bold text-red-800 block">Known Drug Allergies:</span>
                  <span className="text-red-700 font-semibold">Penicillin, Sulfa drugs</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block">Chronic Conditions:</span>
                  <span>Hypertension, Mild Osteoarthritis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 6. NAMED CARE OFFICER CARD WITH VIBRANT ACCENTS
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/care-officer/named-care-officer-card.tsx', `
import React from 'react';
import { Phone, ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export const NamedCareOfficerCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#12C395]/15 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#12C395] to-[#0ba17a] text-white flex items-center justify-center font-black text-2xl shadow-lg glow-primary animate-float">
          RK
        </div>
        <div>
          <span className="text-[10px] font-black text-[#12C395] uppercase tracking-widest block">
            Dedicated Care Officer
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">Ramesh Kumar</h3>
          <p className="text-xs text-slate-500 font-medium">Ex-Armed Forces Medical Corps (12 yrs)</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed mb-4 font-medium">
        "I conduct regular in-person vitals checks, coordinate doctor house calls, and verify emergency readiness for Gopalakrishnan-ji."
      </p>

      <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
        <span className="font-bold text-slate-700">Caseload Transparency:</span>
        <span className="bg-[#edfaf5] text-[#0ba17a] px-3 py-1 rounded-xl font-extrabold border border-[#12C395]/30">
          35 Families Max
        </span>
      </div>

      <a
        href="tel:+919845099888"
        className="mt-5 w-full py-3.5 bg-slate-900 hover:bg-gradient-to-r hover:from-[#12C395] hover:to-[#0ba17a] text-white text-xs font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
      >
        <Phone className="w-4 h-4" />
        <span>Direct Contact (+91 98450 99888)</span>
      </a>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 7. CALENDAR, SERVICES & WALLET WITH POPOINS & THEME
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/calendar/dual-timezone-badge.tsx', `
'use client';

import React from 'react';
import { Clock, Globe } from 'lucide-react';

interface DualTimezoneBadgeProps {
  scheduledAt: string | Date;
  viewerTimezone?: string;
}

export const DualTimezoneBadge: React.FC<DualTimezoneBadgeProps> = ({
  scheduledAt,
  viewerTimezone = 'America/Los_Angeles',
}) => {
  const date = new Date(scheduledAt);

  const istString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  const viewerString = new Intl.DateTimeFormat('en-US', {
    timeZone: viewerTimezone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);

  return (
    <div className="inline-flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium">
      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
        <Clock className="w-4 h-4 text-[#12C395]" />
        <span>{istString} IST (India)</span>
      </div>
      <span className="text-slate-300">•</span>
      <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
        <Globe className="w-4 h-4 text-[#FE1D8F]" />
        <span>Your Time: {viewerString}</span>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/components/services/quota-pricing-badge.tsx', `
import React from 'react';
import { Check, Wallet } from 'lucide-react';
import { formatPaiseToRupees } from '@/lib/utils';

interface QuotaPricingBadgeProps {
  isIncludedInPlan: boolean;
  quotaRemaining?: number;
  pricePaise: number;
}

export const QuotaPricingBadge: React.FC<QuotaPricingBadgeProps> = ({
  isIncludedInPlan,
  quotaRemaining = 1,
  pricePaise,
}) => {
  if (isIncludedInPlan && quotaRemaining > 0) {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-[#edfaf5] text-[#0ba17a] border border-[#12C395]/40 shadow-xs">
        <Check className="w-3.5 h-3.5 text-[#12C395]" />
        <span>Included in Plan (₹0)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-[#fee5f2] text-[#FE1D8F] border border-[#FE1D8F]/30 shadow-xs">
      <Wallet className="w-3.5 h-3.5 text-[#FE1D8F]" />
      <span>Pay-Per-Use: {formatPaiseToRupees(pricePaise)}</span>
    </span>
  );
};
`);

writeFile('apps/family-portal/src/app/wallet/page.tsx', `
'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { WalletTopupModal } from '@/components/wallet/wallet-topup-modal';
import { TransactionLedger } from '@/components/wallet/transaction-ledger';
import { formatPaiseToRupees } from '@/lib/utils';
import { Wallet, Plus, ShieldCheck, Download, Sparkles } from 'lucide-react';

export default function WalletPage() {
  const [balancePaise, setBalancePaise] = useState(1500000); // ₹15,000
  const [showTopup, setShowTopup] = useState(false);

  const transactions = [
    { id: 'tx-1', type: 'CREDIT' as const, amountPaise: 1500000, description: 'Initial Wallet Topup (UPI)', createdAt: '2026-08-15T09:00:00.000Z' },
    { id: 'tx-2', type: 'HOLD' as const, amountPaise: 150000, description: 'Hold for Doctor Home Visit #MED-03', createdAt: '2026-08-20T11:00:00.000Z' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Wallet Balance Hero Card */}
        <div className="bg-gradient-to-br from-[#0b0f19] to-[#151b28] rounded-3xl p-8 sm:p-10 text-white shadow-2xl mb-8 relative overflow-hidden glow-dual">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#12C395]/20 to-[#FE1D8F]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-[#12C395] uppercase tracking-widest">
                  In-App Domestic INR Wallet
                </span>
                <Sparkles className="w-4 h-4 text-[#FE1D8F] animate-spin" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mt-2 tracking-tight">
                {formatPaiseToRupees(balancePaise)}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Zero forex surcharge • Instant holds for doctors, diagnostics & emergency prescriptions
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTopup(true)}
                className="px-6 py-4 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white text-xs font-extrabold rounded-2xl transition-all duration-300 shadow-xl glow-primary flex items-center space-x-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add INR Funds</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <TransactionLedger transactions={transactions} />

        {showTopup && (
          <WalletTopupModal
            walletId="wallet-blr-001"
            onClose={() => setShowTopup(false)}
            onSuccess={() => {
              setBalancePaise((prev) => prev + 500000);
              alert('Wallet topped up successfully!');
            }}
          />
        )}
      </main>
    </div>
  );
}
`);

console.log('Finished updating UI skin with #12C395 Primary, #FE1D8F Secondary, and Poppins font');

