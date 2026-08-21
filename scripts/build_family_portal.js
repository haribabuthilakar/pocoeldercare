const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', relPath);
}

// -------------------------------------------------------------
// 1. CONFIGS
// -------------------------------------------------------------

writeFile('apps/family-portal/tsconfig.json', `
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`);

writeFile('apps/family-portal/next.config.mjs', `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@poco/types'],
};

export default nextConfig;
`);

writeFile('apps/family-portal/postcss.config.mjs', `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

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
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
export default config;
`);

writeFile('apps/family-portal/vitest.config.ts', `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`);

writeFile('apps/family-portal/src/test-setup.ts', `
import '@testing-library/jest-dom';
`);

writeFile('apps/family-portal/src/lib/utils.ts', `
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPaiseToRupees(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
`);

// -------------------------------------------------------------
// 2. API CLIENT & AUTH CONTEXT
// -------------------------------------------------------------

writeFile('apps/family-portal/src/lib/api-client.ts', `
export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('poco_access_token');
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('poco_refresh_token');
  }

  static setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('poco_access_token', accessToken);
    localStorage.setItem('poco_refresh_token', refreshToken);
  }

  static clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('poco_access_token');
    localStorage.removeItem('poco_refresh_token');
    localStorage.removeItem('poco_user');
    localStorage.removeItem('poco_active_household');
  }

  static async fetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...(options.headers || {}),
    };

    const url = \`\${this.baseUrl}\${endpoint.startsWith('/') ? endpoint : \`/\${endpoint}\`}\`;
    let response = await fetch(url, { ...options, headers });

    // Handle token refresh if 401 Unauthorized
    if (response.status === 401) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(\`\${this.baseUrl}/auth/refresh\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newTokens = refreshData.data || refreshData;
            this.setTokens(newTokens.accessToken, newTokens.refreshToken);

            // Retry original request with new token
            (headers as any)['Authorization'] = \`Bearer \${newTokens.accessToken}\`;
            response = await fetch(url, { ...options, headers });
          } else {
            this.clearTokens();
          }
        } catch {
          this.clearTokens();
        }
      }
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return (data.data !== undefined ? data.data : data) as T;
  }
}
`);

writeFile('apps/family-portal/src/lib/auth-context.tsx', `
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from './api-client';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  activeRole?: string;
  roles?: any[];
}

interface AuthContextType {
  user: User | null;
  activeHouseholdId: string | null;
  activeHouseholdName: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<{ devOtp?: string }>;
  logout: () => void;
  setActiveHousehold: (id: string, name: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(null);
  const [activeHouseholdName, setActiveHouseholdName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('poco_user');
    const storedHhId = localStorage.getItem('poco_active_household_id');
    const storedHhName = localStorage.getItem('poco_active_household_name');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    if (storedHhId) {
      setActiveHouseholdId(storedHhId);
      setActiveHouseholdName(storedHhName || 'Household');
    } else {
      // Default to Bangalore household in dev
      setActiveHouseholdId('hh-blr-001');
      setActiveHouseholdName('Menon Residence (Bangalore)');
    }

    setIsLoading(false);
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const res = await ApiClient.fetch('/auth/login/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    ApiClient.setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    localStorage.setItem('poco_user', JSON.stringify(res.user));
    if (!activeHouseholdId) {
      setActiveHousehold('hh-blr-001', 'Menon Residence (Bangalore)');
    }
  };

  const sendOtp = async (phone: string) => {
    return ApiClient.fetch('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    const res = await ApiClient.fetch('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    ApiClient.setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    localStorage.setItem('poco_user', JSON.stringify(res.user));
    if (!activeHouseholdId) {
      setActiveHousehold('hh-blr-001', 'Menon Residence (Bangalore)');
    }
  };

  const logout = () => {
    ApiClient.clearTokens();
    setUser(null);
  };

  const setActiveHousehold = (id: string, name: string) => {
    setActiveHouseholdId(id);
    setActiveHouseholdName(name);
    localStorage.setItem('poco_active_household_id', id);
    localStorage.setItem('poco_active_household_name', name);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeHouseholdId,
        activeHouseholdName,
        loginWithEmail,
        loginWithOtp,
        sendOtp,
        logout,
        setActiveHousehold,
        isAuthenticated: !!user || (typeof window !== 'undefined' && !!ApiClient.getAccessToken()),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
`);

// -------------------------------------------------------------
// 3. GLOBALS CSS & LAYOUT
// -------------------------------------------------------------

writeFile('apps/family-portal/src/app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
`);

// -------------------------------------------------------------
// 4. NAVIGATION & HEADER
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/layout/portal-header.tsx', `
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { HeartPulse, Calendar, Layers, Wallet, Sparkles, LogOut, PhoneCall, ShieldAlert } from 'lucide-react';

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm font-bold text-xl">
              P
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Pococare</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                Family Portal
              </span>
            </div>
          </div>

          {/* Multi-Household Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
            <span className="text-xs text-slate-500 font-medium px-2">Household:</span>
            <select
              value={activeHouseholdName?.includes('Bangalore') ? 'hh-blr-001' : 'hh-hyd-002'}
              onChange={(e) => {
                if (e.target.value === 'hh-blr-001') {
                  setActiveHousehold('hh-blr-001', 'Menon Residence (Bangalore)');
                } else {
                  setActiveHousehold('hh-hyd-002', 'Varma Villa (Hyderabad)');
                }
              }}
              className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="hh-blr-001">Menon Residence (Bangalore)</option>
              <option value="hh-hyd-002">Varma Villa (Hyderabad)</option>
            </select>
          </div>

          {/* 24x7 Helpline Indicator & User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>24x7 Emergency Helpline Active</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.name}</span>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-8 -mb-px overflow-x-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={\`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors \${
                  isActive
                    ? 'border-brand-600 text-brand-700 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }\`}
              >
                <Icon className={\`w-4 h-4 \${isActive ? 'text-brand-600' : 'text-slate-400'}\`} />
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
// 5. LOGIN PAGE & HOME REDIRECT
// -------------------------------------------------------------

writeFile('apps/family-portal/src/app/page.tsx', `
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Connecting to Pococare Family Portal...</p>
      </div>
    </div>
  );
}
`);

writeFile('apps/family-portal/src/app/login/page.tsx', `
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Phone, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 items-center justify-center mb-3 shadow-md">
            <span className="font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pococare Family Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Peace of mind for your parents in India</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setAuthMethod('otp'); setError(null); }}
            className={\`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all \${
              authMethod === 'otp'
                ? 'border-brand-600 text-brand-600 bg-brand-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }\`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone OTP</span>
          </button>
          <button
            onClick={() => { setAuthMethod('email'); setError(null); }}
            className={\`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all \${
              authMethod === 'email'
                ? 'border-brand-600 text-brand-600 bg-brand-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }\`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Login (NRI)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {authMethod === 'otp' ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919845023456"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20"
                >
                  <span>{loading ? 'Sending...' : 'Get Instant OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <span>OTP sent to {phone}</span>
                  {devOtpHint && <span className="font-bold">Dev OTP: {devOtpHint}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full text-center tracking-widest text-2xl py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Portal'}</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 mt-2"
                >
                  Change phone number
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram.menon@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20"
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
// 6. VITALS TREND CHART & HEALTH BADGES
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/vitals/health-summary-badge.tsx', `
import React from 'react';
import { CheckCircle2, AlertTriangle, Activity, UserCheck } from 'lucide-react';

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
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-600',
      icon: CheckCircle2,
    },
    NEEDS_ATTENTION: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-600',
      icon: AlertTriangle,
    },
    CRITICAL: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-600',
      icon: AlertTriangle,
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={\`p-4 rounded-2xl border \${config.border} \${config.bg} flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm\`}>
      <div className="flex items-center space-x-3">
        <div className={\`w-10 h-10 rounded-xl \${config.badge} text-white flex items-center justify-center shadow\`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className={\`font-bold text-base \${config.text}\`}>{label}</h3>
            <span className={\`text-xs font-semibold px-2 py-0.5 rounded-full bg-white \${config.text} border \${config.border}\`}>
              {status === 'STABLE' ? 'All Vitals in Safe Range' : status}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Geriatric baseline parameters monitored daily by Pococare clinical desk
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 self-start md:self-auto">
        <UserCheck className="w-4 h-4 text-brand-600" />
        <span>Reviewed by <strong className="text-slate-800">{doctorReviewed}</strong></span>
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Geriatric Vitals Trend</h2>
          <p className="text-xs text-slate-500">
            Automated green safe-zone reference bands with clinical telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Metric Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMetric('bp')}
              className={\`px-3 py-1 text-xs font-semibold rounded-lg transition \${
                metric === 'bp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              BP (mmHg)
            </button>
            <button
              onClick={() => setMetric('spo2')}
              className={\`px-3 py-1 text-xs font-semibold rounded-lg transition \${
                metric === 'spo2' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              SpO2 (%)
            </button>
            <button
              onClick={() => setMetric('glucose')}
              className={\`px-3 py-1 text-xs font-semibold rounded-lg transition \${
                metric === 'glucose' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              Glucose
            </button>
            <button
              onClick={() => setMetric('pulse')}
              className={\`px-3 py-1 text-xs font-semibold rounded-lg transition \${
                metric === 'pulse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              Pulse
            </button>
          </div>

          {/* Timeframe */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={\`px-2.5 py-1 text-xs font-semibold rounded-lg transition \${
                  timeframe === tf ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
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
              <ReferenceArea y1={90} y2={140} fill="#ecfdf5" fillOpacity={0.7} />
              <ReferenceLine y={140} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[60, 160]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="systolicBp"
                name="Systolic BP"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diastolicBp"
                name="Diastolic BP"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0284c7' }}
              />
            </LineChart>
          ) : metric === 'spo2' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              {/* Safe SpO2 >= 94% */}
              <ReferenceArea y1={94} y2={100} fill="#ecfdf5" fillOpacity={0.7} />
              <ReferenceLine y={94} stroke="#10b981" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="spo2Percent"
                name="SpO2 %"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
              />
            </LineChart>
          ) : metric === 'glucose' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              {/* Fasting Normal Safe Zone: 70 - 130 mg/dL */}
              <ReferenceArea y1={70} y2={130} fill="#ecfdf5" fillOpacity={0.7} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[60, 200]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="glucoseFasting"
                name="Fasting Glucose (mg/dL)"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
              />
            </LineChart>
          ) : (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={60} y2={90} fill="#ecfdf5" fillOpacity={0.7} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 110]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="pulseBpm"
                name="Pulse (BPM)"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ec4899' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-400" />
            <span>Green Band: Geriatric Safe Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Measured Telemetry</span>
          </div>
        </div>
        <span className="text-slate-400">Latest reading: Today 08:30 AM (In-Person Bluetooth)</span>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 7. DASHBOARD PAGE
// -------------------------------------------------------------

writeFile('apps/family-portal/src/app/dashboard/page.tsx', `
'use client';

import React from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { HealthSummaryBadge } from '@/components/vitals/health-summary-badge';
import { VitalsTrendChart } from '@/components/vitals/vitals-trend-chart';
import { NamedCareOfficerCard } from '@/components/care-officer/named-care-officer-card';
import { User, Phone, MapPin, AlertCircle, Shield, ArrowUpRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Top Elderly Member Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 border-2 border-brand-200 text-brand-800 flex items-center justify-center font-bold text-2xl shadow-sm">
                GM
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-slate-900">Gopalakrishnan Menon</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Sampoorna Care Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Age: 79 • Blood: O+</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Indiranagar, Bangalore</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+919845012345</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/services"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center space-x-1"
              >
                <span>Book Service</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
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

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Blood Pressure</span>
                <div className="text-xl font-bold text-slate-900 mt-1">128/82</div>
                <span className="text-xs text-emerald-600 font-medium">Normal Range</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Oxygen (SpO2)</span>
                <div className="text-xl font-bold text-slate-900 mt-1">98%</div>
                <span className="text-xs text-emerald-600 font-medium">Optimal</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Blood Glucose</span>
                <div className="text-xl font-bold text-slate-900 mt-1">105 mg/dL</div>
                <span className="text-xs text-emerald-600 font-medium">Fasting Target</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Pulse Rate</span>
                <div className="text-xl font-bold text-slate-900 mt-1">74 bpm</div>
                <span className="text-xs text-emerald-600 font-medium">Resting Normal</span>
              </div>
            </div>
          </div>

          {/* Right Col: Named Care Officer Card & Emergency Readiness */}
          <div className="space-y-6">
            <NamedCareOfficerCard />

            {/* ICE Emergency Card Quick View */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-brand-600" />
                  <span>ICE Emergency Medical Sheet</span>
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Synced
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700 block">Preferred Hospital:</span>
                  <span>Manipal Hospital Old Airport Rd (+918025024444)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700 block">Known Allergies:</span>
                  <span className="text-red-600 font-semibold">Penicillin, Sulfa drugs</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700 block">Chronic Conditions:</span>
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
// 8. DUAL-TIMEZONE CALENDAR
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

  // Format in IST
  const istString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  // Format in Viewer Timezone
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
    <div className="inline-flex flex-wrap items-center gap-2 p-2 bg-slate-100 rounded-xl text-xs">
      <div className="flex items-center space-x-1 font-semibold text-slate-800">
        <Clock className="w-3.5 h-3.5 text-brand-600" />
        <span>{istString} IST (India)</span>
      </div>
      <span className="text-slate-400">•</span>
      <div className="flex items-center space-x-1 text-slate-600">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span>Your Time: {viewerString}</span>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/components/calendar/appointment-card.tsx', `
import React from 'react';
import { DualTimezoneBadge } from './dual-timezone-badge';
import { Stethoscope, User, Video, FileText, CheckCircle } from 'lucide-react';

interface AppointmentCardProps {
  title: string;
  category: 'DOCTOR_HOME_VISIT' | 'TELECONSULT' | 'CARE_OFFICER_VISIT' | 'DIAGNOSTICS';
  scheduledAt: string;
  doctorOrOfficerName: string;
  notes?: string;
  status?: string;
  viewerTimezone?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  title,
  category,
  scheduledAt,
  doctorOrOfficerName,
  notes,
  status = 'CONFIRMED',
  viewerTimezone,
}) => {
  const iconConfig = {
    DOCTOR_HOME_VISIT: { icon: Stethoscope, color: 'bg-indigo-600' },
    TELECONSULT: { icon: Video, color: 'bg-emerald-600' },
    CARE_OFFICER_VISIT: { icon: User, color: 'bg-brand-600' },
    DIAGNOSTICS: { icon: FileText, color: 'bg-amber-600' },
  }[category];

  const Icon = iconConfig.icon;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-200 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3.5">
          <div className={\`w-10 h-10 rounded-xl \${iconConfig.color} text-white flex items-center justify-center shadow flex-shrink-0 mt-0.5\`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">{title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">With <strong className="text-slate-700">{doctorOrOfficerName}</strong></p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {status}
        </span>
      </div>

      <div className="mt-4">
        <DualTimezoneBadge scheduledAt={scheduledAt} viewerTimezone={viewerTimezone} />
      </div>

      {notes && (
        <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {notes}
        </p>
      )}
    </div>
  );
};
`);

writeFile('apps/family-portal/src/app/calendar/page.tsx', `
'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { AppointmentCard } from '@/components/calendar/appointment-card';
import { Globe, Plus, Calendar as CalIcon } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const [selectedTz, setSelectedTz] = useState('America/Los_Angeles');

  const appointments = [
    {
      title: 'Quarterly Geriatric Comprehensive Evaluation',
      category: 'DOCTOR_HOME_VISIT' as const,
      scheduledAt: '2026-08-25T10:30:00.000Z',
      doctorOrOfficerName: 'Dr. Anand Kulkarni (MD Geriatrics)',
      notes: 'Focus on balance stability, blood pressure medication optimization, and fall risk score.',
    },
    {
      title: 'Bi-Weekly Care Officer Health & Social Visit',
      category: 'CARE_OFFICER_VISIT' as const,
      scheduledAt: '2026-08-28T16:00:00.000Z',
      doctorOrOfficerName: 'Ramesh Kumar (Ex-AFMC)',
      notes: 'Vitals capture, pillbox medication restock check, and mobility check.',
    },
    {
      title: 'Fasting Lipid & HbA1c Sample Collection',
      category: 'DIAGNOSTICS' as const,
      scheduledAt: '2026-09-02T07:30:00.000Z',
      doctorOrOfficerName: 'Apollo Diagnostics Phlebotomist',
      notes: '12-hour fasting required prior to visit.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Header & Timezone Switcher */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dual-Timezone Family Calendar</h1>
            <p className="text-xs text-slate-500 mt-1">
              Synchronize doctor visits and care officer check-ins between India and your local time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
              <Globe className="w-4 h-4 text-brand-600" />
              <span className="text-slate-600 font-medium">Your Timezone:</span>
              <select
                value={selectedTz}
                onChange={(e) => setSelectedTz(e.target.value)}
                className="font-semibold bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none"
              >
                <option value="America/Los_Angeles">US Pacific (PDT / UTC-7)</option>
                <option value="America/New_York">US Eastern (EDT / UTC-4)</option>
                <option value="Europe/London">UK (GMT / BST / UTC+1)</option>
                <option value="Asia/Dubai">Dubai (GST / UTC+4)</option>
                <option value="Asia/Singapore">Singapore (SGT / UTC+8)</option>
                <option value="Asia/Kolkata">India (IST / UTC+5:30)</option>
              </select>
            </div>

            <Link
              href="/services"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Visit</span>
            </Link>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.map((apt, idx) => (
            <AppointmentCard key={idx} {...apt} viewerTimezone={selectedTz} />
          ))}
        </div>
      </main>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 9. 90-SERVICE CATALOG & BOOKING MODAL
// -------------------------------------------------------------

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
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600" />
        <span>Included in Plan (₹0)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
      <Wallet className="w-3 h-3 text-amber-600" />
      <span>Pay-Per-Use: {formatPaiseToRupees(pricePaise)}</span>
    </span>
  );
};
`);

writeFile('apps/family-portal/src/components/services/service-booking-modal.tsx', `
'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { formatPaiseToRupees } from '@/lib/utils';
import { X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServiceBookingModalProps {
  service: {
    id: string;
    code: string;
    name: string;
    pricePaise: number;
    isIncludedInPlan: boolean;
    quotaRemaining?: number;
  };
  householdId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  householdId,
  onClose,
  onSuccess,
}) => {
  const [scheduledDate, setScheduledDate] = useState('2026-08-25');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. If extra charge, check wallet hold
      if (!service.isIncludedInPlan) {
        const wallet = await ApiClient.fetch(\`/billing/wallet/\${householdId}\`);
        if (wallet.balancePaise < service.pricePaise) {
          throw new Error(
            \`Insufficient wallet balance (\${formatPaiseToRupees(wallet.balancePaise)}). Top-up required for \${formatPaiseToRupees(service.pricePaise)}.\`
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{service.code}</span>
            <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto mb-3 animate-bounce" />
            <h4 className="font-bold text-slate-900 text-lg">Booking Confirmed!</h4>
            <p className="text-xs text-slate-500 mt-1">Care officer & clinic notified. Dual-time alert sent.</p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Service Fee:</span>
              <span className="font-bold text-slate-900">
                {service.isIncludedInPlan ? '₹0 (Included in Plan Quota)' : formatPaiseToRupees(service.pricePaise)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time (IST)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Special Instructions / Symptoms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Routine review, check knee swelling..."
                rows={3}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                {loading ? 'Confirming...' : 'Confirm & Schedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/app/services/page.tsx', `
'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { QuotaPricingBadge } from '@/components/services/quota-pricing-badge';
import { ServiceBookingModal } from '@/components/services/service-booking-modal';
import { Search, Filter, Stethoscope, Heart, Home, Shield, Sparkles } from 'lucide-react';

const sampleServices = [
  { id: '1', code: 'EMG-01', name: '24x7 SOS Dispatch & Ambulance Escalation', category: 'A_EMERGENCY', pricePaise: 0, isIncludedInPlan: true },
  { id: '2', code: 'MED-03', name: 'Geriatrician / Doctor Home Visit', category: 'B_CLINICAL', pricePaise: 150000, isIncludedInPlan: true, quotaRemaining: 2 },
  { id: '3', code: 'MED-04', name: 'GP & Specialist Video Teleconsultation', category: 'B_CLINICAL', pricePaise: 60000, isIncludedInPlan: true, quotaRemaining: 4 },
  { id: '4', code: 'MED-06', name: 'Home Blood Sample Collection (NABL Lab)', category: 'B_CLINICAL', pricePaise: 45000, isIncludedInPlan: true },
  { id: '5', code: 'CARE-01', name: 'Care Officer Bi-Weekly In-Person Health Visit', category: 'C_CARE_OFFICER', pricePaise: 0, isIncludedInPlan: true },
  { id: '6', code: 'NUR-01', name: 'Post-Op Wound Dressing & Bedsore Management', category: 'D_NURSING', pricePaise: 80000, isIncludedInPlan: false },
  { id: '7', code: 'PT-01', name: 'Geriatric Fall Prevention & Gait Physiotherapy', category: 'E_PHYSIOTHERAPY', pricePaise: 75000, isIncludedInPlan: false },
  { id: '8', code: 'HOM-01', name: 'Emergency Plumbing / Electrical Repair Facilitation', category: 'G_HOME_SAFETY', pricePaise: 35000, isIncludedInPlan: true },
  { id: '9', code: 'ADM-01', name: 'Cashless Hospital TPA Insurance Claim Liaison', category: 'J_ADMIN_FINANCIAL', pricePaise: 0, isIncludedInPlan: true },
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [bookingService, setBookingService] = useState<any | null>(null);

  const categories = [
    { key: 'ALL', label: 'All 90 Services' },
    { key: 'A_EMERGENCY', label: 'Emergency (A)' },
    { key: 'B_CLINICAL', label: 'Doctor & Diagnostics (B)' },
    { key: 'C_CARE_OFFICER', label: 'Care Officer (C)' },
    { key: 'D_NURSING', label: 'Nursing (D)' },
    { key: 'E_PHYSIOTHERAPY', label: 'Physiotherapy (E)' },
  ];

  const filtered = sampleServices.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">90-Service Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse included subscription quotas and book extra specialized services with instant wallet holds
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor visit, ECG, nursing..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-3 mb-6">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={\`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition \${
                selectedCategory === c.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }\`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div key={service.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-brand-200 transition">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {service.code}
                  </span>
                  <QuotaPricingBadge
                    isIncludedInPlan={service.isIncludedInPlan}
                    quotaRemaining={service.quotaRemaining}
                    pricePaise={service.pricePaise}
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{service.name}</h3>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">Verified SOP Execution</span>
                <button
                  onClick={() => setBookingService(service)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {bookingService && (
          <ServiceBookingModal
            service={bookingService}
            householdId="hh-blr-001"
            onClose={() => setBookingService(null)}
            onSuccess={() => alert('Service booked successfully!')}
          />
        )}
      </main>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 10. INR WALLET & MONTHLY VALUE DIGEST
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/wallet/wallet-topup-modal.tsx', `
'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { formatPaiseToRupees } from '@/lib/utils';
import { X, CreditCard, ShieldCheck } from 'lucide-react';

interface WalletTopupModalProps {
  walletId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletTopupModal: React.FC<WalletTopupModalProps> = ({
  walletId,
  onClose,
  onSuccess,
}) => {
  const [amountRupees, setAmountRupees] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ApiClient.fetch(\`/billing/wallet/\${walletId}/topup\`, {
        method: 'POST',
        body: JSON.stringify({
          amountPaise: amountRupees * 100,
          paymentReference: \`PG-INR-\${Date.now()}\`,
          description: 'Family In-App Wallet Recharge',
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              ₹
            </div>
            <h3 className="text-lg font-bold text-slate-900">Add Wallet Balance</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleTopup} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountRupees(amt)}
                className={\`py-2.5 text-xs font-bold rounded-xl border transition \${
                  amountRupees === amt
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }\`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Amount (INR)</label>
            <input
              type="number"
              min={500}
              step={500}
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              required
              className="w-full text-base font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>Instant domestic UPI & Card gateway with zero forex surcharges</span>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              {loading ? 'Processing...' : \`Pay ₹\${amountRupees.toLocaleString('en-IN')}\`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/components/wallet/transaction-ledger.tsx', `
import React from 'react';
import { formatPaiseToRupees } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Lock, RotateCcw } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'HOLD' | 'DEBIT' | 'REFUND';
  amountPaise: number;
  description: string;
  createdAt: string;
}

export const TransactionLedger: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-sm">Wallet Audit Ledger</h3>
        <span className="text-xs text-slate-500">Paise-accurate ledger</span>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.map((tx) => {
          const isCredit = tx.type === 'CREDIT' || tx.type === 'REFUND';
          return (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
              <div className="flex items-center space-x-3">
                <div className={\`w-8 h-8 rounded-xl flex items-center justify-center text-white \${
                  tx.type === 'CREDIT' ? 'bg-emerald-600' :
                  tx.type === 'HOLD' ? 'bg-amber-500' :
                  tx.type === 'REFUND' ? 'bg-indigo-600' : 'bg-slate-700'
                }\`}>
                  {tx.type === 'CREDIT' && <ArrowDownLeft className="w-4 h-4" />}
                  {tx.type === 'HOLD' && <Lock className="w-4 h-4" />}
                  {tx.type === 'REFUND' && <RotateCcw className="w-4 h-4" />}
                  {tx.type === 'DEBIT' && <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={\`text-xs font-bold \${isCredit ? 'text-emerald-600' : 'text-slate-900'}\`}>
                  {isCredit ? '+' : '-'}{formatPaiseToRupees(tx.amountPaise)}
                </span>
                <span className="block text-xs text-slate-400 capitalize">{tx.type.toLowerCase()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
import { Wallet, Plus, ShieldCheck, Download } from 'lucide-react';

export default function WalletPage() {
  const [balancePaise, setBalancePaise] = useState(1500000); // ₹15,000
  const [showTopup, setShowTopup] = useState(false);

  const transactions = [
    { id: 'tx-1', type: 'CREDIT' as const, amountPaise: 1500000, description: 'Initial Wallet Topup (UPI)', createdAt: '2026-08-15T09:00:00.000Z' },
    { id: 'tx-2', type: 'HOLD' as const, amountPaise: 150000, description: 'Hold for Doctor Home Visit #MED-03', createdAt: '2026-08-20T11:00:00.000Z' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Wallet Balance Hero Card */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
                In-App Domestic INR Wallet
              </span>
              <h1 className="text-4xl font-extrabold mt-2 tracking-tight">
                {formatPaiseToRupees(balancePaise)}
              </h1>
              <p className="text-xs text-slate-400 mt-1">Available balance for extra diagnostics, doctors, and pharmacy</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTopup(true)}
                className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl transition shadow-lg flex items-center space-x-2"
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

writeFile('apps/family-portal/src/components/care-officer/named-care-officer-card.tsx', `
import React from 'react';
import { Phone, Award, ShieldCheck, Heart } from 'lucide-react';

export const NamedCareOfficerCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
          RK
        </div>
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Dedicated Care Officer</span>
          <h3 className="text-lg font-bold text-slate-900">Ramesh Kumar</h3>
          <p className="text-xs text-slate-500">Ex-Armed Forces Medical Corps (12 yrs)</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-4">
        "I conduct regular in-person vitals checks, coordinate doctor house calls, and verify emergency readiness for Gopalakrishnan-ji."
      </p>

      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
        <span className="font-semibold text-slate-700">Caseload Transparency:</span>
        <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">35 Families max</span>
      </div>

      <a
        href="tel:+919845099888"
        className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
      >
        <Phone className="w-3.5 h-3.5" />
        <span>Direct Contact (+91 98450 99888)</span>
      </a>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/components/digest/monthly-value-digest.tsx', `
import React from 'react';
import { Award, CheckCircle2, HeartPulse, ShieldAlert, Download } from 'lucide-react';

export const MonthlyValueDigest: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Peace of Mind Report</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">August 2026 Monthly Care Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">Household: Menon Residence (Bangalore) • Sampoorna Plan</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print / PDF Invoice</span>
        </button>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-2xl font-extrabold text-brand-700">4</span>
          <p className="text-xs font-semibold text-slate-600 mt-1">In-Person Visits Completed</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-2xl font-extrabold text-brand-700">28</span>
          <p className="text-xs font-semibold text-slate-600 mt-1">Daily Vitals Logged</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-2xl font-extrabold text-emerald-700">1</span>
          <p className="text-xs font-semibold text-slate-600 mt-1">Preventive Catch (BP Adjusted)</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-2xl font-extrabold text-indigo-700">100%</span>
          <p className="text-xs font-semibold text-slate-600 mt-1">Emergency Readiness Score</p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <h4 className="font-bold text-emerald-900 text-sm mb-1">Clinical Intervention Summary</h4>
          <p>
            On Aug 18, Care Officer Ramesh Kumar noted morning systolic BP elevated at 130 mmHg. Dr. Anand Kulkarni reviewed telemetry, adjusted Amlodipine dosage, and scheduled a confirmatory follow-up, successfully stabilizing baseline pressure to 125/79 mmHg without hospital admission.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm mb-1">Quantified Family Peace of Mind & Savings</h4>
          <p>
            Estimated hospitalization savings this month: <strong>₹45,000</strong> through timely medication review. All emergency access paths (ambulance priority route, ICE sheet, hospital pre-clearance) remain active.
          </p>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/app/digest/page.tsx', `
'use client';

import React from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { MonthlyValueDigest } from '@/components/digest/monthly-value-digest';

export default function DigestPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <MonthlyValueDigest />
      </main>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 11. COMPREHENSIVE FRONTEND TEST SUITE
// -------------------------------------------------------------

writeFile('apps/family-portal/src/__tests__/portal-workflows.spec.tsx', `
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DualTimezoneBadge } from '../components/calendar/dual-timezone-badge';
import { QuotaPricingBadge } from '../components/services/quota-pricing-badge';
import { HealthSummaryBadge } from '../components/vitals/health-summary-badge';

describe('Family Portal UI Component Workflows', () => {
  it('should format dual timezone dates in both IST and viewer local time', () => {
    render(
      <DualTimezoneBadge
        scheduledAt="2026-08-25T10:30:00.000Z"
        viewerTimezone="America/Los_Angeles"
      />
    );
    expect(screen.getByText(/IST/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Time:/i)).toBeInTheDocument();
  });

  it('should render ₹0 included badge for subscription quota services', () => {
    render(
      <QuotaPricingBadge
        isIncludedInPlan={true}
        quotaRemaining={2}
        pricePaise={150000}
      />
    );
    expect(screen.getByText(/Included in Plan \(₹0\)/i)).toBeInTheDocument();
  });

  it('should render pay-per-use badge with transparent INR pricing when not in plan', () => {
    render(
      <QuotaPricingBadge
        isIncludedInPlan={false}
        pricePaise={80000}
      />
    );
    expect(screen.getByText(/Pay-Per-Use: ₹800.00/i)).toBeInTheDocument();
  });

  it('should render health summary badge with doctor review attribution', () => {
    render(
      <HealthSummaryBadge
        status="STABLE"
        label="Overall Vitals: Controlled"
        doctorReviewed="Dr. Anand Kulkarni"
      />
    );
    expect(screen.getByText(/Overall Vitals: Controlled/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Anand Kulkarni/i)).toBeInTheDocument();
  });
});
`);

console.log('Finished writing all components, pages, and tests for Family Portal');


