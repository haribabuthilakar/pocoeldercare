import React, { useState } from 'react';
import { useAuth } from '../auth/auth-context';
import { COLORS } from '../theme/colors';
import { Phone, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const LoginScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { loginWithOtp } = useAuth();
  const [phone, setPhone] = useState('+919845099888');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(phone, otp);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.slateBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: COLORS.navy,
            padding: '32px 24px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '28px',
              color: '#fff',
              marginBottom: '12px',
              boxShadow: '0 8px 24px rgba(18,195,149,0.3)',
            }}
          >
            P
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Pococare Field App</h1>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
            Care Officer Mobile Operations Engine
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} style={{ padding: '28px 24px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '10px 14px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              Care Officer Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              6-Digit OTP (Dev: 123456)
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '4px',
                textAlign: 'center',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              border: 'none',
              borderRadius: '16px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(18,195,149,0.35)',
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Shift'}</span>
            <ShieldCheck size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
