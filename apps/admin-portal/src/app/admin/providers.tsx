'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '@poco/constants';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

interface StaffContextType {
  user: StaffUser;
  setUser: (user: StaffUser) => void;
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

  return (
    <QueryClientProvider client={queryClient}>
      <StaffUserContext.Provider value={{ user, setUser }}>
        {children}
      </StaffUserContext.Provider>
    </QueryClientProvider>
  );
}
