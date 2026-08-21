import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfficerUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  assignedCity: string;
  caseloadRatio: string;
}

interface AuthContextType {
  officer: OfficerUser | null;
  isAuthenticated: boolean;
  loginWithOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

const defaultMockOfficer: OfficerUser = {
  id: 'officer-001',
  name: 'Ramesh Kumar',
  phone: '+919845099888',
  role: 'CARE_OFFICER_FIELD',
  assignedCity: 'Bangalore East',
  caseloadRatio: '35 Families Max',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officer, setOfficer] = useState<OfficerUser | null>(defaultMockOfficer);

  const loginWithOtp = async (phone: string, otp: string): Promise<boolean> => {
    if (otp === '123456' || otp.length === 6) {
      setOfficer(defaultMockOfficer);
      return true;
    }
    throw new Error('Invalid OTP. Use dev code 123456');
  };

  const logout = () => {
    setOfficer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        officer,
        isAuthenticated: !!officer,
        loginWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
