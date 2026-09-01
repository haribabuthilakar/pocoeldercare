import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/auth-context';
import { LoginScreen } from './login';
import { PinLockScreen } from './pin-lock';
import { DrawerMenu } from '../components/navigation/drawer-menu';

export interface FieldAppLayoutProps {
  children?: React.ReactNode;
  initialRoute?: string;
  syncPill?: React.ReactNode;
}

const FieldAppShell: React.FC<FieldAppLayoutProps> = ({
  children,
  initialRoute = 'visits',
  syncPill,
}) => {
  const { isAuthenticated, isPinLocked, setupPinRequired, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(initialRoute);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Loading Poco Field...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (isPinLocked || setupPinRequired) {
    return <PinLockScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <DrawerMenu
        activeRoute={currentRoute}
        onRouteChange={setCurrentRoute}
        syncPillComponent={syncPill}
      />
      <main className="flex-1 max-w-lg w-full mx-auto p-4 pb-20">{children}</main>
    </div>
  );
};

export const AppLayout: React.FC<FieldAppLayoutProps> = (props) => {
  return (
    <AuthProvider>
      <FieldAppShell {...props} />
    </AuthProvider>
  );
};
export default AppLayout;
