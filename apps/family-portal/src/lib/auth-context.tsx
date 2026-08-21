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
