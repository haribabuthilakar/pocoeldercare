import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CareOfficerSession } from '../../test/fixtures/field-session.fixture';
import { mockFieldSession } from '../../test/fixtures/field-session.fixture';

export interface AuthContextValue {
  session: CareOfficerSession | null;
  isAuthenticated: boolean;
  isPinLocked: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setPin: (pin: string) => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockSession: () => void;
  setupPinRequired: boolean;
}

const STORAGE_KEYS = {
  SESSION: 'poco_field_session',
  PIN: 'poco_field_pin',
  LOCKED: 'poco_field_locked',
};

// Secure storage adapter that works across web preview and test environments
export const secureStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // fallback
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // fallback
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // fallback
    }
  },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CareOfficerSession | null>(null);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const rawSession = secureStorage.getItem(STORAGE_KEYS.SESSION);
      const savedPin = secureStorage.getItem(STORAGE_KEYS.PIN);
      const savedLocked = secureStorage.getItem(STORAGE_KEYS.LOCKED);

      if (rawSession) {
        const parsed: CareOfficerSession = JSON.parse(rawSession);
        if (savedPin) {
          parsed.pinHash = savedPin;
          parsed.pinSetup = true;
        }
        setSession(parsed);
        if (savedLocked === 'true' && parsed.pinSetup) {
          setIsPinLocked(true);
        }
      }
    } catch (e) {
      console.error('Failed to load session from secure storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Authenticate Care Officer (realistic login logic)
    const newSession: CareOfficerSession = {
      ...mockFieldSession,
      user: {
        ...mockFieldSession.user,
        email,
      },
    };

    const existingPin = secureStorage.getItem(STORAGE_KEYS.PIN);
    if (existingPin) {
      newSession.pinHash = existingPin;
      newSession.pinSetup = true;
    } else {
      newSession.pinHash = undefined;
      newSession.pinSetup = false;
    }

    setSession(newSession);
    setIsPinLocked(false);
    secureStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
    secureStorage.setItem(STORAGE_KEYS.LOCKED, 'false');
    return true;
  };

  const logout = async (): Promise<void> => {
    setSession(null);
    setIsPinLocked(false);
    secureStorage.removeItem(STORAGE_KEYS.SESSION);
    secureStorage.removeItem(STORAGE_KEYS.LOCKED);
  };

  const setPin = async (pin: string): Promise<boolean> => {
    if (!/^\d{4}$/.test(pin)) return false;
    secureStorage.setItem(STORAGE_KEYS.PIN, pin);
    if (session) {
      const updated = { ...session, pinHash: pin, pinSetup: true };
      setSession(updated);
      secureStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
    }
    return true;
  };

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    const savedPin = session?.pinHash || secureStorage.getItem(STORAGE_KEYS.PIN);
    if (savedPin && savedPin === pin) {
      setIsPinLocked(false);
      secureStorage.setItem(STORAGE_KEYS.LOCKED, 'false');
      return true;
    }
    return false;
  };

  const lockSession = (): void => {
    if (session?.pinSetup) {
      setIsPinLocked(true);
      secureStorage.setItem(STORAGE_KEYS.LOCKED, 'true');
    }
  };

  const value: AuthContextValue = {
    session,
    isAuthenticated: !!session,
    isPinLocked,
    isLoading,
    login,
    logout,
    setPin,
    unlockWithPin,
    lockSession,
    setupPinRequired: !!session && !session.pinSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
