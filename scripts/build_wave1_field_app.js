const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. PACKAGE CONFIGS & THEME
// -------------------------------------------------------------

writeFile('apps/field-app/package.json', JSON.stringify({
  "name": "field-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@poco/types": "workspace:*",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.474.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "jsdom": "^26.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}, null, 2));

writeFile('apps/field-app/tsconfig.json', JSON.stringify({
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}, null, 2));

writeFile('apps/field-app/vitest.config.ts', `
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
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

writeFile('apps/field-app/src/test-setup.ts', `
import '@testing-library/jest-dom';
`);

writeFile('apps/field-app/src/theme/colors.ts', `
export const COLORS = {
  primary: '#12C395', // Mint / Emerald Green
  primaryDark: '#0ba17a',
  primaryLight: '#edfaf5',
  primaryBorder: 'rgba(18, 195, 149, 0.4)',
  
  secondary: '#FE1D8F', // Vivid Magenta / Pink
  secondaryDark: '#e40974',
  secondaryLight: '#fee5f2',
  secondaryBorder: 'rgba(254, 29, 143, 0.4)',

  navy: '#0b0f19',
  navyCard: '#151b28',
  slateBg: '#f8fbfb',
  textMain: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',

  hazardAmber: '#f59e0b',
  hazardDark: '#b45309',
};
`);

// -------------------------------------------------------------
// 2. OFFLINE SQLITE / LOCAL REPOSITORY & MUTATION QUEUE
// -------------------------------------------------------------

writeFile('apps/field-app/src/db/sqlite-client.ts', `
export interface OfflineVisit {
  id: string;
  householdId: string;
  seniorName: string;
  seniorAge: number;
  seniorPhone: string;
  address: string;
  gpsCoords: { lat: number; lng: number };
  preferredHospital: string;
  emergencyPhone: string;
  planName: 'Kavach' | 'Sahara' | 'Sampoorna';
  scheduledTimeIST: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface OfflineVitalsReading {
  id: string;
  visitId: string;
  memberId: string;
  systolicBp: number;
  diastolicBp: number;
  pulseBpm: number;
  spo2Percent: number;
  glucoseMgDl?: number;
  glucoseType?: 'FASTING' | 'RANDOM' | 'POST_PRANDIAL';
  temperatureF?: number;
  weightKg?: number;
  isAbnormal: boolean;
  escalatedToDoctor: boolean;
  capturedAt: string;
}

export interface OfflineSopExecution {
  id: string;
  visitId: string;
  sopTemplateCode: string;
  stepResults: {
    stepId: string;
    stepName: string;
    category: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED';
    photoUri?: string;
    audioUri?: string;
    notes?: string;
  }[];
  durationSeconds: number;
  completedAt: string;
}

export interface SyncMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  retryCount: number;
  createdAt: string;
}

class LocalStoreManager {
  private visits: Map<string, OfflineVisit> = new Map();
  private vitals: Map<string, OfflineVitalsReading> = new Map();
  private sopExecutions: Map<string, OfflineSopExecution> = new Map();
  private mutationQueue: SyncMutation[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const mockVisits: OfflineVisit[] = [
      {
        id: 'visit-001',
        householdId: 'hh-blr-001',
        seniorName: 'Gopalakrishnan Menon',
        seniorAge: 79,
        seniorPhone: '+91 98450 12345',
        address: '#402, 12th Main, HAL 2nd Stage, Indiranagar, Bangalore',
        gpsCoords: { lat: 12.9716, lng: 77.6412 },
        preferredHospital: 'Manipal Hospital Old Airport Rd',
        emergencyPhone: '+91 80 2502 4444',
        planName: 'Sampoorna',
        scheduledTimeIST: '10:00 AM',
        status: 'PENDING',
      },
      {
        id: 'visit-002',
        householdId: 'hh-blr-002',
        seniorName: 'Kalyani Raghavan',
        seniorAge: 82,
        seniorPhone: '+91 98450 67890',
        address: 'B-304, Palm Meadows, Whitefield, Bangalore',
        gpsCoords: { lat: 12.9698, lng: 77.7499 },
        preferredHospital: 'Columbia Asia Whitefield',
        emergencyPhone: '+91 80 6165 6262',
        planName: 'Sahara',
        scheduledTimeIST: '02:30 PM',
        status: 'PENDING',
      },
    ];

    mockVisits.forEach((v) => this.visits.set(v.id, v));
  }

  // Visits CRUD
  getVisits(): OfflineVisit[] {
    return Array.from(this.visits.values());
  }

  getVisitById(id: string): OfflineVisit | undefined {
    return this.visits.get(id);
  }

  updateVisitStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    const visit = this.visits.get(id);
    if (visit) {
      visit.status = status;
      this.visits.set(id, visit);
    }
  }

  // Vitals CRUD & Mutation Enqueue
  saveVitals(reading: OfflineVitalsReading) {
    this.vitals.set(reading.id, reading);
    this.enqueueMutation({
      id: \`mut-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
      endpoint: '/vitals/log',
      method: 'POST',
      payload: reading,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
  }

  getVitalsByVisit(visitId: string): OfflineVitalsReading[] {
    return Array.from(this.vitals.values()).filter((v) => v.visitId === visitId);
  }

  // SOP Executions CRUD & Mutation Enqueue
  saveSopExecution(exec: OfflineSopExecution) {
    this.sopExecutions.set(exec.id, exec);
    this.updateVisitStatus(exec.visitId, 'COMPLETED');
    this.enqueueMutation({
      id: \`mut-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
      endpoint: '/catalog/sop/executions',
      method: 'POST',
      payload: exec,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
  }

  // Sync Mutation Queue
  enqueueMutation(mutation: SyncMutation) {
    this.mutationQueue.push(mutation);
  }

  getQueue(): SyncMutation[] {
    return [...this.mutationQueue];
  }

  getPendingQueueCount(): number {
    return this.mutationQueue.length;
  }

  clearQueue() {
    this.mutationQueue = [];
  }

  removeMutation(id: string) {
    this.mutationQueue = this.mutationQueue.filter((m) => m.id !== id);
  }
}

export const localStore = new LocalStoreManager();
`);

writeFile('apps/field-app/src/db/sync-worker.ts', `
import { localStore, SyncMutation } from './sqlite-client';

export class SyncWorker {
  private static isOnlineStatus: boolean = true;
  private static isSyncing: boolean = false;
  private static listeners: ((isOnline: boolean, pendingCount: number) => void)[] = [];

  static setOnline(online: boolean) {
    this.isOnlineStatus = online;
    this.notifyListeners();
    if (online) {
      this.drainQueue();
    }
  }

  static isOnline(): boolean {
    return this.isOnlineStatus;
  }

  static getPendingCount(): number {
    return localStore.getPendingQueueCount();
  }

  static subscribe(listener: (isOnline: boolean, pendingCount: number) => void) {
    this.listeners.push(listener);
    listener(this.isOnlineStatus, this.getPendingCount());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach((l) => l(this.isOnlineStatus, this.getPendingCount()));
  }

  static async drainQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || !this.isOnlineStatus) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    const queue = localStore.getQueue();
    let synced = 0;
    let failed = 0;

    for (const mutation of queue) {
      try {
        // Simulate API call sync with NestJS Core API
        await new Promise((resolve) => setTimeout(resolve, 80));
        localStore.removeMutation(mutation.id);
        synced++;
      } catch (err) {
        mutation.retryCount += 1;
        failed++;
      }
    }

    this.isSyncing = false;
    this.notifyListeners();
    return { synced, failed };
  }
}
`);

// -------------------------------------------------------------
// 3. AUTH & OFFLINE STATUS BANNER
// -------------------------------------------------------------

writeFile('apps/field-app/src/auth/auth-context.tsx', `
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
`);

writeFile('apps/field-app/src/components/common/offline-status-banner.tsx', `
import React, { useState, useEffect } from 'react';
import { SyncWorker } from '../../db/sync-worker';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../theme/colors';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(SyncWorker.isOnline());
  const [pendingCount, setPendingCount] = useState(SyncWorker.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return SyncWorker.subscribe((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await SyncWorker.drainQueue();
    setIsSyncing(false);
  };

  const toggleOnline = () => {
    SyncWorker.setOnline(!isOnline);
  };

  return (
    <div
      style={{
        backgroundColor: isOnline ? COLORS.primaryLight : '#fff1f2',
        borderBottom: \`1px solid \${isOnline ? COLORS.primaryBorder : '#fecdd3'}\`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={toggleOnline}
          title="Click to toggle offline mode simulation"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isOnline ? (
            <Wifi size={16} color={COLORS.primary} />
          ) : (
            <WifiOff size={16} color="#e11d48" />
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isOnline ? COLORS.primaryDark : '#be123c',
            }}
          >
            {isOnline ? 'Online (Field Sync Active)' : 'Offline (Local SQLite Cache)'}
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {pendingCount > 0 && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#fee5f2',
              color: COLORS.secondary,
              padding: '2px 8px',
              borderRadius: '12px',
              border: \`1px solid \${COLORS.secondaryBorder}\`,
            }}
          >
            {pendingCount} Pending Sync
          </span>
        )}

        {isOnline && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: COLORS.primaryDark,
            }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
`);

writeFile('apps/field-app/src/screens/login-screen.tsx', `
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
              background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`,
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
              background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.primaryDark})\`,
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
`);

console.log('Finished generating Wave 1 Field App scaffold, offline SQLite client, sync worker and auth');

