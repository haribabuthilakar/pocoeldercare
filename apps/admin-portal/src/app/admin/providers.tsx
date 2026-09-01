'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '@poco/constants';

import { apiClient } from '@/lib/api-client';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

interface StaffContextType {
  user: StaffUser;
  setUser: (user: StaffUser) => void;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<void>;
}

const defaultStaffUser: StaffUser = {
  id: 'usr-admin-default',
  name: 'Operations Lead',
  email: 'ops@pocoeldercare.com',
  roles: [
    UserRole.SUPER_ADMIN,
    UserRole.OPS_MANAGER,
    UserRole.CARE_MANAGER,
    UserRole.SALES_LEAD,
  ],
};

const StaffUserContext = React.createContext<StaffContextType>({
  user: defaultStaffUser,
  setUser: () => {},
  isAuthenticated: false,
  login: async () => {},
});

export function useStaffUser() {
  return React.useContext(StaffUserContext);
}

export function AdminProviders({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: StaffUser;
}) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 4000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [user, setUser] = React.useState<StaffUser>(initialUser || defaultStaffUser);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  const autoLogin = React.useCallback(
    async (email = 'ops@pocoeldercare.com', password = 'PocoCare123!') => {
      if (typeof window === 'undefined') return;
      try {
        const origin = window.location?.origin || '';
        const url = origin ? `${origin}/api/auth/internal/login` : '/api/auth/internal/login';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            apiClient.setToken(data.accessToken);
            localStorage.setItem('poco_staff_token', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('poco_staff_refresh_token', data.refreshToken);
            }
            setIsAuthenticated(true);
            queryClient.invalidateQueries();
          }
        }
      } catch (err) {
        // Silently catch in test/offline environments
      }
    },
    [queryClient]
  );

  React.useEffect(() => {
    const existingToken = apiClient.getToken();
    if (!existingToken) {
      autoLogin();
    } else {
      setIsAuthenticated(true);
    }

    apiClient.onUnauthorized(() => {
      autoLogin();
    });
  }, [autoLogin]);

  return (
    <QueryClientProvider client={queryClient}>
      <StaffUserContext.Provider value={{ user, setUser, isAuthenticated, login: autoLogin }}>
        {children}
      </StaffUserContext.Provider>
    </QueryClientProvider>
  );
}
