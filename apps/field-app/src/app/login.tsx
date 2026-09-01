import React, { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Shield, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('care.officer.1@poco.care');
  const [password, setPassword] = useState('PocoCare123!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.trim() || !password || !password.trim()) {
      setError('Please provide work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError('Invalid Care Officer credentials. Please check and try again.');
      }
    } catch {
      setError('Connection failed. Please check network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 text-white">
            <Shield className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Poco Care Officer</h1>
          <p className="text-sm text-slate-600 mt-1">Field Operations & Offline Visit Companion</p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            {error && (
              <div
                data-testid="login-error-alert"
                className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                data-testid="login-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder-slate-400 text-sm"
                placeholder="care.officer@poco.care"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                data-testid="login-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder-slate-400 text-sm"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit-button"
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In & Sync</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Preset Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              data-testid="quick-demo-fill"
              onClick={() => {
                setEmail('care.officer.1@poco.care');
                setPassword('PocoCare123!');
              }}
              className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Demo: care.officer.1@poco.care
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;
