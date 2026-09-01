import React, { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import {
  Menu,
  X,
  Calendar,
  Home,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Lock,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

export interface DrawerMenuProps {
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
  syncPillComponent?: React.ReactNode;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  activeRoute = 'visits',
  onRouteChange,
  syncPillComponent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { session, logout, lockSession } = useAuth();

  const handleNavigate = (route: string) => {
    onRouteChange?.(route);
    setIsOpen(false);
  };

  const navItems = [
    { id: 'visits', label: 'Today Visits', icon: Calendar },
    { id: 'households', label: 'Assigned Households', icon: Home },
    { id: 'feed', label: 'Activity Feed / Notes', icon: MessageSquare },
    { id: 'conflicts', label: 'Conflict Review', icon: AlertTriangle },
    { id: 'settings', label: 'Sync & Diagnostics', icon: RefreshCw },
  ];

  return (
    <div className="relative z-50">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            data-testid="drawer-menu-button"
            className="p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <span className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Poco Field
            </span>
            <p className="text-xs text-slate-500 font-medium">{session?.cluster || 'Field Officer Portal'}</p>
          </div>
        </div>

        {/* Persistent Sync Pill or Actions */}
        <div className="flex items-center gap-2">
          {syncPillComponent}
          <button
            type="button"
            onClick={lockSession}
            data-testid="quick-lock-button"
            title="Lock Session"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          data-testid="drawer-backdrop"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <aside
        data-testid="drawer-panel"
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header with Officer Profile */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Care Officer
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              data-testid="drawer-close-button"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200">
              {session?.fullName?.charAt(0) || <User className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base" data-testid="drawer-officer-name">
                {session?.fullName || 'Care Officer'}
              </h3>
              <p className="text-xs text-slate-500">{session?.user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {session?.cluster || 'Assigned Zone'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-item-${item.id}`}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <button
            type="button"
            data-testid="drawer-lock-button"
            onClick={() => {
              lockSession();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-200/60 font-medium"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            Lock Session (PIN)
          </button>
          <button
            type="button"
            data-testid="drawer-logout-button"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 font-medium"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
};
