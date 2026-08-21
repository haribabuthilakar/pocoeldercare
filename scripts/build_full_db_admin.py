import os

def write_file(rel_path, content):
    full_path = os.path.abspath(rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print('Written:', rel_path)

# 1. package.json
write_file('apps/db-admin/package.json', '''{
  "name": "db-admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3005",
    "build": "next build",
    "start": "next start -p 3005",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@poco/config": "workspace:*",
    "@poco/database": "workspace:*",
    "@poco/types": "workspace:*",
    "clsx": "^2.1.1",
    "lucide-react": "^0.474.0",
    "next": "14.2.20",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "jsdom": "^26.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}''')

# 2. next.config.mjs
write_file('apps/db-admin/next.config.mjs', '''/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@poco/types', '@poco/config', '@poco/database'],
  reactStrictMode: true,
};

export default nextConfig;
''')

# 3. postcss.config.mjs
write_file('apps/db-admin/postcss.config.mjs', '''export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
''')

# 4. tailwind.config.ts
write_file('apps/db-admin/tailwind.config.ts', '''import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#12C395',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f472b6',
          400: '#f43f5e',
          500: '#FE1D8F',
          600: '#e11d48',
          700: '#be123c',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
''')

# 5. tsconfig.json
write_file('apps/db-admin/tsconfig.json', '''{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}''')

# 6. vitest.config.ts
write_file('apps/db-admin/vitest.config.ts', '''import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
''')

# 7. test-setup.ts
write_file('apps/db-admin/src/test-setup.ts', '''import '@testing-library/jest-dom';
''')

# 8. globals.css
write_file('apps/db-admin/src/app/globals.css', '''@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.bento-card {
  background: #ffffff;
  border-radius: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
}
''')

# 9. lib/table-schemas.ts
write_file('apps/db-admin/src/lib/table-schemas.ts', '''export interface TableField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'datetime' | 'json';
  isId?: boolean;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface TableDefinition {
  name: string;
  displayName: string;
  category: 'Core & RBAC' | 'Households & Members' | 'Catalog & SOPs' | 'Billing & Wallets' | 'Operations' | 'Clinical & Vitals' | 'Emergency';
  iconName: string;
  primaryKey: string;
  fields: TableField[];
}

export const TABLE_DEFINITIONS: Record<string, TableDefinition> = {
  User: {
    name: 'User',
    displayName: 'Users & Identity',
    category: 'Core & RBAC',
    iconName: 'User',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'User ID', type: 'string', isId: true, required: true },
      { name: 'name', label: 'Full Name', type: 'string', required: true },
      { name: 'phone', label: 'Phone Number', type: 'string', required: true },
      { name: 'email', label: 'Email Address', type: 'string' },
      { name: 'isActive', label: 'Account Active', type: 'boolean', required: true },
      { name: 'createdAt', label: 'Created At', type: 'datetime' },
      { name: 'updatedAt', label: 'Updated At', type: 'datetime' },
    ],
  },
  UserRoleMapping: {
    name: 'UserRoleMapping',
    displayName: 'User Role Mappings',
    category: 'Core & RBAC',
    iconName: 'Shield',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Mapping ID', type: 'string', isId: true, required: true },
      { name: 'userId', label: 'User ID (FK)', type: 'string', required: true },
      { name: 'role', label: 'Role Type', type: 'enum', options: ['ADMIN', 'OPS_MANAGER', 'DISPATCHER', 'CARE_OFFICER', 'DOCTOR', 'NURSE', 'PHYSIOTHERAPIST', 'FAMILY_PRIMARY_NRI', 'FAMILY_PRIMARY_LOCAL', 'FAMILY_VIEWER', 'ELDER'], required: true },
      { name: 'householdId', label: 'Household ID (FK)', type: 'string' },
      { name: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
  Household: {
    name: 'Household',
    displayName: 'Households',
    category: 'Households & Members',
    iconName: 'Home',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Household ID', type: 'string', isId: true, required: true },
      { name: 'name', label: 'Household Name', type: 'string', required: true },
      { name: 'city', label: 'City', type: 'string', required: true },
      { name: 'addressLine', label: 'Address Line', type: 'string', required: true },
      { name: 'postalCode', label: 'Postal Code', type: 'string', required: true },
      { name: 'primaryContactPhone', label: 'Primary Contact Phone', type: 'string', required: true },
      { name: 'timeZone', label: 'Time Zone', type: 'string', required: true },
      { name: 'careOfficerId', label: 'Assigned Care Officer ID', type: 'string' },
      { name: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
  Member: {
    name: 'Member',
    displayName: 'Household Members (Seniors)',
    category: 'Households & Members',
    iconName: 'Users',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Member ID', type: 'string', isId: true, required: true },
      { name: 'householdId', label: 'Household ID (FK)', type: 'string', required: true },
      { name: 'firstName', label: 'First Name', type: 'string', required: true },
      { name: 'lastName', label: 'Last Name', type: 'string', required: true },
      { name: 'phone', label: 'Phone Number', type: 'string' },
      { name: 'relationship', label: 'Relationship', type: 'string', required: true },
      { name: 'gender', label: 'Gender', type: 'string' },
      { name: 'abhaNumber', label: 'ABHA Number', type: 'string' },
      { name: 'abhaStatus', label: 'ABHA Status', type: 'enum', options: ['NOT_LINKED', 'PENDING', 'LINKED', 'FAILED'], required: true },
      { name: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
  IceProfile: {
    name: 'IceProfile',
    displayName: 'Emergency ICE Profiles',
    category: 'Households & Members',
    iconName: 'HeartPulse',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'ICE ID', type: 'string', isId: true, required: true },
      { name: 'memberId', label: 'Senior Member ID (FK)', type: 'string', required: true },
      { name: 'bloodGroup', label: 'Blood Group', type: 'string' },
      { name: 'allergies', label: 'Allergies (JSON)', type: 'json' },
      { name: 'chronicConditions', label: 'Chronic Conditions (JSON)', type: 'json' },
      { name: 'currentMedications', label: 'Current Medications (JSON)', type: 'json' },
      { name: 'preferredHospitalName', label: 'Preferred Hospital Name', type: 'string' },
      { name: 'preferredHospitalPhone', label: 'Preferred Hospital Phone', type: 'string' },
      { name: 'active', label: 'Active Status', type: 'boolean', required: true },
      { name: 'lastReviewedAt', label: 'Last Reviewed At', type: 'datetime' },
    ],
  },
  ServiceCatalog: {
    name: 'ServiceCatalog',
    displayName: '90-Service Catalog',
    category: 'Catalog & SOPs',
    iconName: 'BookOpen',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Service ID', type: 'string', isId: true, required: true },
      { name: 'serviceNumber', label: 'Service #', type: 'number', required: true },
      { name: 'code', label: 'Service Code', type: 'string', required: true },
      { name: 'name', label: 'Service Name', type: 'string', required: true },
      { name: 'category', label: 'Category', type: 'enum', options: ['A_EMERGENCY', 'B_PRIMARY_CARE', 'C_DIAGNOSTICS', 'D_MEDICATION', 'E_THERAPY', 'F_HIGH_DEPENDENCY', 'G_RECORDS_INSURANCE', 'H_DAILY_LIVING', 'I_FINANCIAL_LEGAL', 'J_MOBILITY_TRAVEL', 'K_COMPANIONSHIP', 'L_FAMILY_LAYER'], required: true },
      { name: 'unitPricePaise', label: 'Unit Price (Paise)', type: 'number', required: true },
      { name: 'slaMinutes', label: 'SLA (Minutes)', type: 'number' },
      { name: 'isPayPerUseOnly', label: 'Pay-Per-Use Only', type: 'boolean' },
    ],
  },
  PlanTier: {
    name: 'PlanTier',
    displayName: 'Subscription Plan Tiers',
    category: 'Catalog & SOPs',
    iconName: 'Layers',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Tier ID', type: 'string', isId: true, required: true },
      { name: 'name', label: 'Tier Name', type: 'enum', options: ['KAVACH', 'SAHARA', 'SAMPOORNA', 'NIVAS'], required: true },
      { name: 'annualPricePaise', label: 'Annual Price (Paise)', type: 'number', required: true },
      { name: 'description', label: 'Tier Description', type: 'string', required: true },
    ],
  },
  PlanQuota: {
    name: 'PlanQuota',
    displayName: 'Plan Quotas',
    category: 'Catalog & SOPs',
    iconName: 'Percent',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Quota ID', type: 'string', isId: true, required: true },
      { name: 'planTierId', label: 'Plan Tier ID (FK)', type: 'string', required: true },
      { name: 'serviceCatalogId', label: 'Service Catalog ID (FK)', type: 'string', required: true },
      { name: 'includedUnitsYear', label: 'Included Units / Year', type: 'number', required: true },
      { name: 'isUnlimited', label: 'Unlimited Quota', type: 'boolean', required: true },
    ],
  },
  SopTemplate: {
    name: 'SopTemplate',
    displayName: 'Dynamic SOP Templates',
    category: 'Catalog & SOPs',
    iconName: 'FileText',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'SOP ID', type: 'string', isId: true, required: true },
      { name: 'serviceCatalogId', label: 'Service Catalog ID (FK)', type: 'string', required: true },
      { name: 'version', label: 'Version #', type: 'number', required: true },
      { name: 'title', label: 'SOP Title', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string', required: true },
      { name: 'jsonSchema', label: 'Checklist Schema (JSON)', type: 'json', required: true },
      { name: 'active', label: 'Active Version', type: 'boolean', required: true },
    ],
  },
  Subscription: {
    name: 'Subscription',
    displayName: 'Household Subscriptions',
    category: 'Billing & Wallets',
    iconName: 'CreditCard',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Subscription ID', type: 'string', isId: true, required: true },
      { name: 'householdId', label: 'Household ID (FK)', type: 'string', required: true },
      { name: 'planTierId', label: 'Plan Tier ID (FK)', type: 'string', required: true },
      { name: 'status', label: 'Subscription Status', type: 'string', required: true },
      { name: 'startDate', label: 'Start Date', type: 'datetime', required: true },
      { name: 'endDate', label: 'End Date', type: 'datetime', required: true },
      { name: 'autoRenew', label: 'Auto Renew', type: 'boolean', required: true },
    ],
  },
  SubscriptionQuotaLedger: {
    name: 'SubscriptionQuotaLedger',
    displayName: 'Subscription Quota Ledgers',
    category: 'Billing & Wallets',
    iconName: 'ListOrdered',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Ledger ID', type: 'string', isId: true, required: true },
      { name: 'subscriptionId', label: 'Subscription ID (FK)', type: 'string', required: true },
      { name: 'serviceCatalogId', label: 'Service Catalog ID (FK)', type: 'string', required: true },
      { name: 'totalAllocated', label: 'Total Allocated', type: 'number', required: true },
      { name: 'usedUnits', label: 'Used Units', type: 'number', required: true },
      { name: 'remainingUnits', label: 'Remaining Units', type: 'number', required: true },
    ],
  },
  Wallet: {
    name: 'Wallet',
    displayName: 'Prepaid Care Wallets',
    category: 'Billing & Wallets',
    iconName: 'Wallet',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Wallet ID', type: 'string', isId: true, required: true },
      { name: 'householdId', label: 'Household ID (FK)', type: 'string', required: true },
      { name: 'balancePaise', label: 'Balance (Paise)', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'string', required: true },
      { name: 'updatedAt', label: 'Updated At', type: 'datetime' },
    ],
  },
  WalletTransaction: {
    name: 'WalletTransaction',
    displayName: 'Wallet Transactions',
    category: 'Billing & Wallets',
    iconName: 'Receipt',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Transaction ID', type: 'string', isId: true, required: true },
      { name: 'walletId', label: 'Wallet ID (FK)', type: 'string', required: true },
      { name: 'amountPaise', label: 'Amount (Paise)', type: 'number', required: true },
      { name: 'type', label: 'Transaction Type', type: 'enum', options: ['CREDIT', 'HOLD', 'DEBIT', 'REFUND'], required: true },
      { name: 'referenceType', label: 'Reference Type', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string', required: true },
      { name: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
  ServiceExecution: {
    name: 'ServiceExecution',
    displayName: 'Service Executions & Visits',
    category: 'Operations',
    iconName: 'CalendarCheck',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Execution ID', type: 'string', isId: true, required: true },
      { name: 'householdId', label: 'Household ID (FK)', type: 'string', required: true },
      { name: 'memberId', label: 'Member ID (FK)', type: 'string', required: true },
      { name: 'serviceCatalogId', label: 'Service Code (FK)', type: 'string', required: true },
      { name: 'assignedToUserId', label: 'Assigned User ID', type: 'string' },
      { name: 'status', label: 'Execution Status', type: 'enum', options: ['SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'], required: true },
      { name: 'scheduledAt', label: 'Scheduled At', type: 'datetime', required: true },
      { name: 'isDrill', label: 'Is Dry Run Drill', type: 'boolean' },
      { name: 'totalChargePaise', label: 'Total Charge (Paise)', type: 'number' },
    ],
  },
  ClinicalConsult: {
    name: 'ClinicalConsult',
    displayName: 'Clinical Consultations',
    category: 'Clinical & Vitals',
    iconName: 'Stethoscope',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Consult ID', type: 'string', isId: true, required: true },
      { name: 'serviceExecutionId', label: 'Execution ID (FK)', type: 'string', required: true },
      { name: 'memberId', label: 'Member ID (FK)', type: 'string', required: true },
      { name: 'doctorUserId', label: 'Doctor User ID (FK)', type: 'string', required: true },
      { name: 'consultType', label: 'Consult Type', type: 'enum', options: ['DOCTOR_HOME_VISIT', 'GP_TELECONSULT', 'SPECIALIST_TELECONSULT'], required: true },
      { name: 'chiefComplaint', label: 'Chief Complaint', type: 'string', required: true },
      { name: 'clinicalNotes', label: 'Clinical Notes', type: 'string', required: true },
      { name: 'diagnosisIcd10', label: 'ICD-10 Diagnosis', type: 'string' },
    ],
  },
  Prescription: {
    name: 'Prescription',
    displayName: 'Prescriptions',
    category: 'Clinical & Vitals',
    iconName: 'Pill',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Prescription ID', type: 'string', isId: true, required: true },
      { name: 'clinicalConsultId', label: 'Consult ID (FK)', type: 'string', required: true },
      { name: 'memberId', label: 'Member ID (FK)', type: 'string', required: true },
      { name: 'doctorUserId', label: 'Doctor User ID (FK)', type: 'string', required: true },
      { name: 'medicationItems', label: 'Medications (JSON)', type: 'json', required: true },
      { name: 'pdfUrl', label: 'Prescription PDF URL', type: 'string' },
      { name: 'issuedAt', label: 'Issued At', type: 'datetime' },
    ],
  },
  VitalsReading: {
    name: 'VitalsReading',
    displayName: 'Vitals Readings',
    category: 'Clinical & Vitals',
    iconName: 'Activity',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Reading ID', type: 'string', isId: true, required: true },
      { name: 'memberId', label: 'Member ID (FK)', type: 'string', required: true },
      { name: 'systolicBp', label: 'Systolic BP (mmHg)', type: 'number' },
      { name: 'diastolicBp', label: 'Diastolic BP (mmHg)', type: 'number' },
      { name: 'bloodGlucoseMgDl', label: 'Blood Glucose (mg/dL)', type: 'number' },
      { name: 'fastingState', label: 'Fasting State', type: 'string' },
      { name: 'pulseBpm', label: 'Pulse (bpm)', type: 'number' },
      { name: 'spo2Percent', label: 'SpO2 (%)', type: 'number' },
      { name: 'isAbnormal', label: 'Abnormal Flag', type: 'boolean' },
      { name: 'recordedAt', label: 'Recorded At', type: 'datetime' },
    ],
  },
  EmergencyEvent: {
    name: 'EmergencyEvent',
    displayName: 'Emergency Events',
    category: 'Emergency',
    iconName: 'ShieldAlert',
    primaryKey: 'id',
    fields: [
      { name: 'id', label: 'Incident ID', type: 'string', isId: true, required: true },
      { name: 'householdId', label: 'Household ID (FK)', type: 'string', required: true },
      { name: 'memberId', label: 'Member ID (FK)', type: 'string', required: true },
      { name: 'initiatedByPhone', label: 'Initiated By Phone', type: 'string', required: true },
      { name: 'severity', label: 'Severity', type: 'enum', options: ['CRITICAL', 'URGENT', 'ROUTINE'], required: true },
      { name: 'status', label: 'Status', type: 'enum', options: ['OPEN', 'DISPATCHED', 'AT_SCENE', 'HOSPITALIZED', 'RESOLVED', 'FALSE_ALARM'], required: true },
      { name: 'outcomeSummary', label: 'Outcome Summary', type: 'string' },
      { name: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
''')

# 10. lib/mock-db-store.ts
write_file('apps/db-admin/src/lib/mock-db-store.ts', '''import { TABLE_DEFINITIONS } from './table-schemas';

export type TableDataStore = Record<string, Record<string, any>[]>;

const initialData: TableDataStore = {
  User: [
    { id: 'usr-admin-01', name: 'Dr. Anand Raman (Admin)', phone: '+919876543210', email: 'anand.raman@pocoeldercare.com', isActive: true, createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-20T12:00:00.000Z' },
    { id: 'usr-officer-01', name: 'Ramesh Kumar (Care Officer)', phone: '+919845012345', email: 'ramesh.k@pocoeldercare.com', isActive: true, createdAt: '2026-08-05T09:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
    { id: 'usr-officer-02', name: 'Suresh Gowda (Care Officer)', phone: '+919845012346', email: 'suresh.g@pocoeldercare.com', isActive: true, createdAt: '2026-08-05T09:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
    { id: 'usr-doctor-01', name: 'Dr. Ananya Sen, MD', phone: '+919845099881', email: 'ananya.sen@apollomed.in', isActive: true, createdAt: '2026-08-10T11:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
    { id: 'usr-family-01', name: 'Arjun Menon (NRI Son)', phone: '+14155552671', email: 'arjun.menon@sftech.io', isActive: true, createdAt: '2026-08-12T04:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
  ],
  UserRoleMapping: [
    { id: 'urm-01', userId: 'usr-admin-01', role: 'ADMIN', householdId: null, createdAt: '2026-08-01T10:00:00.000Z' },
    { id: 'urm-02', userId: 'usr-officer-01', role: 'CARE_OFFICER', householdId: null, createdAt: '2026-08-05T09:00:00.000Z' },
    { id: 'urm-03', userId: 'usr-doctor-01', role: 'DOCTOR', householdId: null, createdAt: '2026-08-10T11:00:00.000Z' },
    { id: 'urm-04', userId: 'usr-family-01', role: 'FAMILY_PRIMARY_NRI', householdId: 'hh-blr-001', createdAt: '2026-08-12T04:00:00.000Z' },
  ],
  Household: [
    { id: 'hh-blr-001', name: 'Menon Residence', city: 'Bangalore', addressLine: '14/2, 12th Main, Indiranagar', postalCode: '560038', primaryContactPhone: '+919845011999', timeZone: 'Asia/Kolkata', careOfficerId: 'usr-officer-01', createdAt: '2026-08-12T04:00:00.000Z' },
    { id: 'hh-blr-002', name: 'Raghavan Residence', city: 'Bangalore', addressLine: '88, 4th Cross, Jayanagar 4th Block', postalCode: '560011', primaryContactPhone: '+919845233441', timeZone: 'Asia/Kolkata', careOfficerId: 'usr-officer-02', createdAt: '2026-08-14T08:00:00.000Z' },
  ],
  Member: [
    { id: 'mbr-001', householdId: 'hh-blr-001', firstName: 'Gopalakrishnan', lastName: 'Menon', phone: '+919845011999', relationship: 'FATHER', gender: 'MALE', abhaNumber: '91-4829-1029-4412', abhaStatus: 'LINKED', createdAt: '2026-08-12T04:00:00.000Z' },
    { id: 'mbr-002', householdId: 'hh-blr-002', firstName: 'Kalyani', lastName: 'Raghavan', phone: '+919845233441', relationship: 'MOTHER', gender: 'FEMALE', abhaNumber: '91-8832-4419-5502', abhaStatus: 'LINKED', createdAt: '2026-08-14T08:00:00.000Z' },
  ],
  IceProfile: [
    { id: 'ice-001', memberId: 'mbr-001', bloodGroup: 'O+', allergies: ['Penicillin', 'Sulfa drugs'], chronicConditions: ['Type 2 Diabetes', 'Hypertension'], currentMedications: ['Metformin 500mg', 'Telmisartan 40mg'], preferredHospitalName: 'Manipal Hospital Indiranagar', preferredHospitalPhone: '+91 80 2502 4444', active: true, lastReviewedAt: '2026-08-20T10:00:00.000Z' },
    { id: 'ice-002', memberId: 'mbr-002', bloodGroup: 'B+', allergies: ['NSAIDs'], chronicConditions: ['Osteoarthritis', 'Hypothyroidism'], currentMedications: ['Thyronorm 50mcg', 'Calcium D3'], preferredHospitalName: 'Apollo Speciality Jayanagar', preferredHospitalPhone: '+91 80 2630 4050', active: true, lastReviewedAt: '2026-08-20T10:00:00.000Z' },
  ],
  ServiceCatalog: [
    { id: 'sc-01', serviceNumber: 1, code: 'EMG-01', name: '24x7 Ambulance Dispatch & Paramedic Assist', category: 'A_EMERGENCY', unitPricePaise: 0, slaMinutes: 15, isPayPerUseOnly: false },
    { id: 'sc-02', serviceNumber: 2, code: 'CO-01', name: 'Bi-Weekly Field Officer Wellness Check-in', category: 'B_PRIMARY_CARE', unitPricePaise: 65000, slaMinutes: 30, isPayPerUseOnly: false },
    { id: 'sc-03', serviceNumber: 3, code: 'MED-03', name: 'Geriatrician Home Consultation Visit', category: 'B_PRIMARY_CARE', unitPricePaise: 150000, slaMinutes: 60, isPayPerUseOnly: true },
  ],
  PlanTier: [
    { id: 'tier-01', name: 'KAVACH', annualPricePaise: 2400000, description: '24x7 Emergency SLA & In-Person Verification' },
    { id: 'tier-02', name: 'SAHARA', annualPricePaise: 4800000, description: 'Primary Care, Doctor Home Visits & Monthly Vitals' },
    { id: 'tier-03', name: 'SAMPOORNA', annualPricePaise: 9600000, description: 'Comprehensive High-Touch Care with Daily Living' },
  ],
  PlanQuota: [
    { id: 'pq-01', planTierId: 'tier-01', serviceCatalogId: 'sc-01', includedUnitsYear: 999, isUnlimited: true },
    { id: 'pq-02', planTierId: 'tier-02', serviceCatalogId: 'sc-02', includedUnitsYear: 24, isUnlimited: false },
  ],
  Subscription: [
    { id: 'sub-01', householdId: 'hh-blr-001', planTierId: 'tier-02', status: 'ACTIVE', startDate: '2026-08-12T00:00:00.000Z', endDate: '2027-08-11T23:59:59.000Z', autoRenew: true },
  ],
  SubscriptionQuotaLedger: [
    { id: 'sql-01', subscriptionId: 'sub-01', serviceCatalogId: 'sc-02', totalAllocated: 24, usedUnits: 4, remainingUnits: 20 },
  ],
  Wallet: [
    { id: 'wal-01', householdId: 'hh-blr-001', balancePaise: 1850000, currency: 'INR', updatedAt: '2026-08-21T09:00:00.000Z' },
  ],
  WalletTransaction: [
    { id: 'tx-01', walletId: 'wal-01', amountPaise: 2500000, type: 'CREDIT', referenceType: 'NRI_RAZORPAY_TOPUP', description: 'Care Wallet Auto-Reload from Arjun Menon', createdAt: '2026-08-12T10:00:00.000Z' },
    { id: 'tx-02', walletId: 'wal-01', amountPaise: 650000, type: 'DEBIT', referenceType: 'SERVICE_PAYMENT', description: 'Payment for MED-03 Geriatrician Home Visit', createdAt: '2026-08-18T14:30:00.000Z' },
  ],
  SopTemplate: [
    { id: 'sop-01', serviceCatalogId: 'sc-02', version: 1, title: 'Bi-Weekly Field Wellness Protocol', description: 'Standard vitals recording, pill box check, and home safety survey', jsonSchema: { steps: ['Measure BP & SpO2', 'Inspect medicine strip counts', 'Check bathroom grip rails'] }, active: true },
  ],
  ServiceExecution: [
    { id: 'exec-01', householdId: 'hh-blr-001', memberId: 'mbr-001', serviceCatalogId: 'sc-02', assignedToUserId: 'usr-officer-01', status: 'COMPLETED', scheduledAt: '2026-08-19T10:00:00.000Z', isDrill: false, totalChargePaise: 65000 },
    { id: 'exec-02', householdId: 'hh-blr-001', memberId: 'mbr-001', serviceCatalogId: 'sc-03', assignedToUserId: 'usr-doctor-01', status: 'SCHEDULED', scheduledAt: '2026-08-22T14:00:00.000Z', isDrill: false, totalChargePaise: 150000 },
  ],
  ClinicalConsult: [
    { id: 'cc-01', serviceExecutionId: 'exec-01', memberId: 'mbr-001', doctorUserId: 'usr-doctor-01', consultType: 'DOCTOR_HOME_VISIT', chiefComplaint: 'Mild knee stiffness and routine diabetes follow-up', clinicalNotes: 'BP stable. Suggested knee strengthening exercises and updated Metformin dosage.', diagnosisIcd10: 'E11.9 (Type 2 Diabetes Mellitus)' },
  ],
  Prescription: [
    { id: 'rx-01', clinicalConsultId: 'cc-01', memberId: 'mbr-001', doctorUserId: 'usr-doctor-01', medicationItems: [{ drugName: 'Metformin XR', dosage: '500mg', frequency: '1-0-1 after meals', durationDays: 30 }], pdfUrl: '/rx/rx_menon_aug2026.pdf', issuedAt: '2026-08-19T11:00:00.000Z' },
  ],
  VitalsReading: [
    { id: 'vr-01', memberId: 'mbr-001', systolicBp: 128, diastolicBp: 82, bloodGlucoseMgDl: 134.0, fastingState: 'POST_PRANDIAL', pulseBpm: 72, spo2Percent: 98.0, isAbnormal: false, recordedAt: '2026-08-19T10:15:00.000Z' },
    { id: 'vr-02', memberId: 'mbr-002', systolicBp: 145, diastolicBp: 92, bloodGlucoseMgDl: 168.0, fastingState: 'FASTING', pulseBpm: 84, spo2Percent: 96.0, isAbnormal: true, recordedAt: '2026-08-20T09:30:00.000Z' },
  ],
  EmergencyEvent: [
    { id: 'emg-01', householdId: 'hh-blr-001', memberId: 'mbr-001', initiatedByPhone: '+919845011999', severity: 'CRITICAL', status: 'RESOLVED', outcomeSummary: 'Resolved at home with doctor follow-up scheduled. False alarm SOS pull.', createdAt: '2026-08-15T03:20:00.000Z' },
  ],
};

class MockDbStore {
  private data: TableDataStore = { ...initialData };
  private listeners: (() => void)[] = [];

  public getTableRows(tableName: string): Record<string, any>[] {
    return this.data[tableName] || [];
  }

  public getRow(tableName: string, id: string): Record<string, any> | undefined {
    const rows = this.getTableRows(tableName);
    return rows.find((r) => r.id === id);
  }

  public createRow(tableName: string, row: Record<string, any>): Record<string, any> {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    const newRecord = {
      id: row.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...row,
    };
    this.data[tableName].unshift(newRecord);
    this.notify();
    return newRecord;
  }

  public updateRow(tableName: string, id: string, updates: Record<string, any>): Record<string, any> | null {
    const rows = this.getTableRows(tableName);
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = {
      ...rows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data[tableName][index] = updated;
    this.notify();
    return updated;
  }

  public deleteRow(tableName: string, id: string): boolean {
    const rows = this.getTableRows(tableName);
    const initialLen = rows.length;
    this.data[tableName] = rows.filter((r) => r.id !== id);
    const deleted = this.data[tableName].length < initialLen;
    if (deleted) this.notify();
    return deleted;
  }

  public getCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    Object.keys(TABLE_DEFINITIONS).forEach((table) => {
      counts[table] = (this.data[table] || []).length;
    });
    return counts;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const dbStore = new MockDbStore();
''')

# 11. components/layout/db-sidebar.tsx
write_file('apps/db-admin/src/components/layout/db-sidebar.tsx', '''\'use client\';

import React, { useState, useEffect } from \'react\';
import Link from \'next/link\';
import { usePathname } from \'next/navigation\';
import { Database, Search, ChevronRight, Layers, Table, Plus, ExternalLink } from \'lucide-react';
import { TABLE_DEFINITIONS } from \'../../lib/table-schemas\';
import { dbStore } from \'../../lib/mock-db-store\';

export const DbSidebar: React.FC = () => {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState(\'\');

  useEffect(() => {
    setCounts(dbStore.getCounts());
    return dbStore.subscribe(() => {
      setCounts(dbStore.getCounts());
    });
  }, []);

  const tables = Object.values(TABLE_DEFINITIONS);
  const categories = Array.from(new Set(tables.map((t) => t.category)));

  const filteredTables = tables.filter((t) =>
    t.displayName.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-slate-900 flex items-center justify-center text-white shadow-xs font-black">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Pococare</span>
                <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                  CRUD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold m-0 tracking-wide">
                Database Administration Hub
              </p>
            </div>
          </Link>
        </div>

        {/* Search Tables Input */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 18 models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 placeholder-slate-400 focus:outline-brand-500"
            />
          </div>
        </div>

        {/* Tables Navigation */}
        <div className="p-3 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
          {categories.map((category) => {
            const categoryTables = filteredTables.filter((t) => t.category === category);
            if (categoryTables.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  {category}
                </span>
                {categoryTables.map((t) => {
                  const href = `/tables/${t.name}`;
                  const isActive = pathname === href;
                  const rowCount = counts[t.name] || 0;

                  return (
                    <Link
                      key={t.name}
                      href={href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all no-underline ${
                        isActive
                          ? 'bg-brand-50 text-brand-800 border border-brand-200/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Table size={14} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                        <span className="truncate">{t.name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rowCount}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <a
          href="http://localhost:3003"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors no-underline"
        >
          <span className="flex items-center gap-2">
            <span>🚀 Operations CRM</span>
          </span>
          <ExternalLink size={13} className="text-slate-400" />
        </a>
      </div>
    </aside>
  );
};
''')

# 12. components/layout/db-header.tsx
write_file('apps/db-admin/src/components/layout/db-header.tsx', '''\'use client\';

import React from \'react\';
import Link from \'next/link\';
import { Database, ShieldCheck, RefreshCw, Terminal, Layers } from \'lucide-react';

export const DbHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-1 rounded-xl bg-brand-50 text-brand-700 font-mono font-bold text-xs border border-brand-200">
          PostgreSQL 16 • Prisma ORM
        </span>
        <span className="text-xs text-slate-400 font-medium hidden md:inline">
          Connected to: pocoeldercare?schema=public
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors no-underline"
        >
          Overview
        </Link>
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-700">18 Tables Synced</span>
      </div>
    </header>
  );
};
''')

# 13. components/crud-table.tsx
write_file('apps/db-admin/src/components/crud-table.tsx', '''\'use client\';

import React, { useState } from \'react\';
import { Search, Plus, Edit2, Trash2, Code, Download, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from \'lucide-react';
import { TableDefinition } from \'../lib/table-schemas\';

interface CrudTableProps {
  definition: TableDefinition;
  rows: Record<string, any>[];
  onCreateClick: () => void;
  onEditClick: (row: Record<string, any>) => void;
  onDeleteClick: (row: Record<string, any>) => void;
  onJsonClick: (row: Record<string, any>) => void;
}

export const CrudTable: React.FC<CrudTableProps> = ({
  definition,
  rows,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onJsonClick,
}) => {
  const [search, setSearch] = useState(\'\');
  const [sortField, setSortField] = useState<string>(definition.primaryKey);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Filter rows
  const filteredRows = rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === \'object\') return JSON.stringify(val).toLowerCase().includes(q);
      return String(val).toLowerCase().includes(q);
    });
  });

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (typeof valA === \'number\' && typeof valB === \'number\') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(fieldName);
      setSortAsc(true);
    }
  };

  const handleExportCsv = () => {
    if (rows.length === 0) return;
    const headers = definition.fields.map((f) => f.name).join(\',\');
    const csvContent = rows
      .map((row) =>
        definition.fields
          .map((f) => {
            const val = row[f.name];
            if (val === null || val === undefined) return \'""\';
            if (typeof val === \'object\') return `"${JSON.stringify(val).replace(/"/g, \'""\')}"`;
            return `"${String(val).replace(/"/g, \'""\')}"`;
          })
          .join(\',\')
      )
      .join(\'\\n\');
    const blob = new Blob([`${headers}\\n${csvContent}`], { type: \'text/csv;charset=utf-8;\' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement(\'a\');
    link.href = url;
    link.setAttribute(\'download\', `${definition.name}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bento-card p-6 space-y-4">
      {/* Table Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${definition.displayName}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder-slate-400 focus:outline-brand-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onCreateClick}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all glow-primary"
          >
            <Plus size={15} />
            <span>Add {definition.name}</span>
          </button>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              {definition.fields.map((field) => (
                <th
                  key={field.name}
                  onClick={() => handleSort(field.name)}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{field.label}</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={definition.fields.length + 1} className="py-8 text-center text-slate-400 font-medium">
                  No records found in table "{definition.name}".
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr key={row[definition.primaryKey] || idx} className="hover:bg-slate-50/80 transition-colors">
                  {definition.fields.map((field) => {
                    const value = row[field.name];

                    return (
                      <td key={field.name} className="py-3 px-4 max-w-[220px] truncate">
                        {field.type === \'boolean\' ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              value
                                ? \'bg-brand-50 text-brand-700 border border-brand-200\'
                                : \'bg-slate-100 text-slate-500\'
                            }`}
                          >
                            {value ? \'TRUE\' : \'FALSE\'}
                          </span>
                        ) : field.type === \'enum\' ? (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">
                            {value || \'—\'}
                          </span>
                        ) : field.type === \'json\' ? (
                          <span className="font-mono text-[11px] text-slate-600 truncate block">
                            {JSON.stringify(value)}
                          </span>
                        ) : field.isId ? (
                          <span className="font-mono text-slate-900 font-bold text-[11px]">
                            {value}
                          </span>
                        ) : (
                          <span className="text-slate-800">
                            {value !== undefined && value !== null ? String(value) : \'—\'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {/* Row Actions */}
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onJsonClick(row)}
                      title="Inspect JSON"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <Code size={13} />
                    </button>
                    <button
                      onClick={() => onEditClick(row)}
                      title="Edit Row"
                      className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(row)}
                      title="Delete Row"
                      className="p-1.5 rounded-lg hover:bg-secondary-50 text-secondary-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
        <span>
          Showing <strong>{sortedRows.length === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{' '}
          <strong>{Math.min(page * pageSize, sortedRows.length)}</strong> of <strong>{sortedRows.length}</strong> rows
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="font-bold text-slate-800">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
''')

# 14. components/record-modal.tsx
write_file('apps/db-admin/src/components/record-modal.tsx', '''\'use client\';

import React, { useState, useEffect } from \'react\';
import { X, CheckCircle2, AlertCircle } from \'lucide-react';
import { TableDefinition } from \'../lib/table-schemas\';

interface RecordModalProps {
  isOpen: boolean;
  definition: TableDefinition;
  initialData?: Record<string, any> | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  definition,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      const defaultForm: Record<string, any> = {};
      definition.fields.forEach((field) => {
        if (field.isId) {
          defaultForm[field.name] = `${definition.name.toLowerCase().substring(0, 3)}-${Date.now()}`;
        } else if (field.type === \'boolean\') {
          defaultForm[field.name] = true;
        } else if (field.type === \'number\') {
          defaultForm[field.name] = 0;
        } else if (field.type === \'enum\' && field.options) {
          defaultForm[field.name] = field.options[0];
        } else if (field.type === \'json\') {
          defaultForm[field.name] = {};
        } else {
          defaultForm[field.name] = \'\';
        }
      });
      setFormData(defaultForm);
    }
    setJsonErrors({});
  }, [initialData, definition, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

  const handleInputChange = (fieldName: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleJsonChange = (fieldName: string, text: string) => {
    try {
      const parsed = JSON.parse(text);
      setFormData((prev) => ({ ...prev, [fieldName]: parsed }));
      setJsonErrors((prev) => ({ ...prev, [fieldName]: \'\' }));
    } catch (e: any) {
      setJsonErrors((prev) => ({ ...prev, [fieldName]: \'Invalid JSON format\' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(jsonErrors).some(Boolean)) {
      alert(\'Please fix JSON syntax errors before saving.\');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-black text-slate-900 m-0">
              {isEditing ? `Edit ${definition.name} Record` : `Create New ${definition.name}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              {definition.displayName} • Table Schema Form
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definition.fields.map((field) => {
              const value = formData[field.name];

              return (
                <div key={field.name} className={field.type === \'json\' ? \'md:col-span-2\' : \'\'}>
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                    {field.label} {field.required && <span className="text-secondary-500">*</span>}
                  </label>

                  {field.type === \'boolean\' ? (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange(field.name, true)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          value === true
                            ? \'bg-brand-500 text-white shadow-xs\'
                            : \'bg-slate-100 text-slate-600 hover:bg-slate-200\'
                        }`}
                      >
                        TRUE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange(field.name, false)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          value === false
                            ? \'bg-slate-900 text-white shadow-xs\'
                            : \'bg-slate-100 text-slate-600 hover:bg-slate-200\'
                        }`}
                      >
                        FALSE
                      </button>
                    </div>
                  ) : field.type === \'enum\' && field.options ? (
                    <select
                      value={value || \'\'}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-brand-500 bg-white"
                      required={field.required}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === \'json\' ? (
                    <div>
                      <textarea
                        rows={4}
                        defaultValue={JSON.stringify(value, null, 2)}
                        onChange={(e) => handleJsonChange(field.name, e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-brand-500 bg-slate-50"
                        placeholder="{}"
                      />
                      {jsonErrors[field.name] && (
                        <span className="text-[10px] text-secondary-500 font-bold block mt-1">
                          ⚠️ {jsonErrors[field.name]}
                        </span>
                      )}
                    </div>
                  ) : field.type === \'number\' ? (
                    <input
                      type="number"
                      value={value !== undefined ? value : \'\'}
                      onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-brand-500"
                      required={field.required}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value !== undefined && value !== null ? String(value) : \'\'}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={field.isId && isEditing}
                      className={`w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-brand-500 ${
                        field.isId ? \'bg-slate-50 font-mono font-bold\' : \'\'
                      }`}
                      required={field.required}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black shadow-xs flex items-center gap-1.5 transition-all glow-primary"
            >
              <CheckCircle2 size={15} />
              <span>{isEditing ? \'Save Changes\' : \'Create Record\'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
''')

# 15. components/delete-confirm-modal.tsx
write_file('apps/db-admin/src/components/delete-confirm-modal.tsx', '''\'use client\';

import React from \'react\';
import { AlertTriangle, Trash2, X } from \'lucide-react';
import { TableDefinition } from \'../lib/table-schemas\';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  definition: TableDefinition;
  row: Record<string, any> | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  definition,
  row,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-600 font-black shadow-xs mx-auto">
          <AlertTriangle size={24} />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-black text-slate-900 m-0">
            Confirm Record Deletion
          </h3>
          <p className="text-xs text-slate-500 font-medium m-0">
            Are you sure you want to delete this record from table <strong className="text-slate-800">{definition.name}</strong>?
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800">
            {definition.primaryKey}: {row[definition.primaryKey]}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all glow-secondary"
          >
            <Trash2 size={14} />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
''')

# 16. components/json-raw-drawer.tsx
write_file('apps/db-admin/src/components/json-raw-drawer.tsx', '''\'use client\';

import React, { useState } from \'react\';
import { X, Copy, Check, Code } from \'lucide-react';
import { TableDefinition } from \'../lib/table-schemas\';

interface JsonRawDrawerProps {
  isOpen: boolean;
  definition: TableDefinition;
  row: Record<string, any> | null;
  onClose: () => void;
}

export const JsonRawDrawer: React.FC<JsonRawDrawerProps> = ({
  isOpen,
  definition,
  row,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !row) return null;

  const jsonString = JSON.stringify(row, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 text-slate-100 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-800">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={16} className="text-brand-400" />
            <h3 className="text-sm font-black text-white m-0">
              Raw Record JSON: {definition.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={13} className="text-brand-400" /> : <Copy size={13} />}
              <span>{copied ? \'Copied!\' : \'Copy JSON\'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-brand-300 leading-relaxed bg-slate-950/80">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
''')

# 17. app/layout.tsx
write_file('apps/db-admin/src/app/layout.tsx', '''import type { Metadata } from \'next\';
import { DbSidebar } from \'../components/layout/db-sidebar\';
import { DbHeader } from \'../components/layout/db-header\';
import \'./globals.css\';

export const metadata: Metadata = {
  title: \'Pococare DB Admin — Universal CRUD Hub\',
  description: \'High-productivity CRUD interface for all 18 tables in the Pococare database\',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        <DbSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DbHeader />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
''')

# 18. app/page.tsx
write_file('apps/db-admin/src/app/page.tsx', '''\'use client\';

import React, { useState, useEffect } from \'react\';
import Link from \'next/link\';
import { Database, Table, ArrowRight, Layers, ShieldCheck, HeartPulse, Activity } from \'lucide-react\';
import { TABLE_DEFINITIONS } from \'../lib/table-schemas\';
import { dbStore } from \'../lib/mock-db-store\';

export default function DbAdminOverviewPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCounts(dbStore.getCounts());
    return dbStore.subscribe(() => {
      setCounts(dbStore.getCounts());
    });
  }, []);

  const tables = Object.values(TABLE_DEFINITIONS);
  const totalRecords = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bento-card p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black uppercase tracking-wider">
            Database Administration Hub
          </span>
          <h1 className="text-xl font-black tracking-tight mt-2 m-0 text-white">
            Universal Prisma Database CRUD Explorer
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1 m-0">
            Direct Create, Read, Update, and Delete operations for all 18 models across Pococare.
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-black text-slate-300 uppercase block">Total Records</span>
            <strong className="text-xl font-black font-mono text-brand-400">{totalRecords}</strong>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-black text-slate-300 uppercase block">Total Models</span>
            <strong className="text-xl font-black font-mono text-white">18</strong>
          </div>
        </div>
      </div>

      {/* Grid of All 18 Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tables.map((table) => {
          const rowCount = counts[table.name] || 0;

          return (
            <Link
              key={table.name}
              href={`/tables/${table.name}`}
              className="bento-card p-5 space-y-3 hover:border-brand-400 transition-all hover:shadow-md no-underline group block"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 flex items-center justify-center font-black transition-colors shadow-xs">
                    <Table size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-brand-700 transition-colors m-0">
                      {table.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      {table.category}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                  {rowCount} rows
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium m-0 truncate">
                {table.displayName} • {table.fields.length} schema fields
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-brand-600 transition-colors">
                <span>Manage Table</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
''')

# 19. app/tables/[tableName]/page.tsx
write_file('apps/db-admin/src/app/tables/[tableName]/page.tsx', '''\'use client\';

import React, { useState, useEffect } from \'react\';
import { useParams, useRouter } from \'next/navigation\';
import { Table, ArrowLeft } from \'lucide-react\';
import { TABLE_DEFINITIONS, TableDefinition } from \'../../../lib/table-schemas\';
import { dbStore } from \'../../../lib/mock-db-store\';
import { CrudTable } from \'../../../components/crud-table\';
import { RecordModal } from \'../../../components/record-modal\';
import { DeleteConfirmModal } from \'../../../components/delete-confirm-modal\';
import { JsonRawDrawer } from \'../../../components/json-raw-drawer\';

export default function TableCrudPage() {
  const params = useParams();
  const router = useRouter();
  const tableName = params.tableName as string;
  const definition: TableDefinition = TABLE_DEFINITIONS[tableName];

  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, any> | null>(null);
  const [deleteRow, setDeleteRow] = useState<Record<string, any> | null>(null);
  const [jsonRow, setJsonRow] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!definition) return;
    setRows(dbStore.getTableRows(tableName));
    return dbStore.subscribe(() => {
      setRows(dbStore.getTableRows(tableName));
    });
  }, [tableName, definition]);

  if (!definition) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-black text-slate-900">Table "{tableName}" not found.</h2>
        <button
          onClick={() => router.push(\'/\')}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  const handleSaveRecord = (data: Record<string, any>) => {
    if (editRow) {
      dbStore.updateRow(tableName, editRow[definition.primaryKey], data);
      setEditRow(null);
    } else {
      dbStore.createRow(tableName, data);
      setIsCreateModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteRow) {
      dbStore.deleteRow(tableName, deleteRow[definition.primaryKey]);
      setDeleteRow(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(\'/\')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
                {definition.name}
              </h1>
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                {definition.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
              {definition.displayName} • {rows.length} total rows
            </p>
          </div>
        </div>
      </div>

      {/* Main CRUD Table Component */}
      <CrudTable
        definition={definition}
        rows={rows}
        onCreateClick={() => setIsCreateModalOpen(true)}
        onEditClick={(row) => setEditRow(row)}
        onDeleteClick={(row) => setDeleteRow(row)}
        onJsonClick={(row) => setJsonRow(row)}
      />

      {/* Create / Edit Modal */}
      <RecordModal
        isOpen={isCreateModalOpen || !!editRow}
        definition={definition}
        initialData={editRow}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditRow(null);
        }}
        onSave={handleSaveRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteRow}
        definition={definition}
        row={deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* JSON Raw Drawer */}
      <JsonRawDrawer
        isOpen={!!jsonRow}
        definition={definition}
        row={jsonRow}
        onClose={() => setJsonRow(null)}
      />
    </div>
  );
}
''')

# 20. __tests__/crud-workflows.spec.tsx
write_file('apps/db-admin/src/__tests__/crud-workflows.spec.tsx', '''import { describe, it, expect } from \'vitest\';
import { TABLE_DEFINITIONS } from \'../lib/table-schemas\';
import { dbStore } from \'../lib/mock-db-store\';

describe(\'Database CRUD Administration App Workflows\', () => {
  it(\'should register all 18 Prisma models with complete field definitions\', () => {
    const tableKeys = Object.keys(TABLE_DEFINITIONS);
    expect(tableKeys.length).toBe(18);
    expect(tableKeys).toContain(\'User\');
    expect(tableKeys).toContain(\'Household\');
    expect(tableKeys).toContain(\'Member\');
    expect(tableKeys).toContain(\'IceProfile\');
    expect(tableKeys).toContain(\'ServiceCatalog\');
    expect(tableKeys).toContain(\'EmergencyEvent\');
    expect(tableKeys).toContain(\'WalletTransaction\');
  });

  it(\'should perform Create, Read, Update, and Delete on User table\', () => {
    // 1. Create
    const newUser = dbStore.createRow(\'User\', {
      name: \'Test Specialist Doctor\',
      phone: \'+919876500000\',
      email: \'test.doc@poco.in\',
      isActive: true,
    });
    expect(newUser.id).toBeDefined();
    expect(newUser.name).toBe(\'Test Specialist Doctor\');

    // 2. Read
    const fetched = dbStore.getRow(\'User\', newUser.id);
    expect(fetched).toBeDefined();
    expect(fetched?.email).toBe(\'test.doc@poco.in\');

    // 3. Update
    const updated = dbStore.updateRow(\'User\', newUser.id, {
      name: \'Dr. Test Specialist (Updated)\',
    });
    expect(updated?.name).toBe(\'Dr. Test Specialist (Updated)\');

    // 4. Delete
    const deleted = dbStore.deleteRow(\'User\', newUser.id);
    expect(deleted).toBe(true);
    expect(dbStore.getRow(\'User\', newUser.id)).toBeUndefined();
  });

  it(\'should manage complex JSON fields in IceProfile table\', () => {
    const ice = dbStore.createRow(\'IceProfile\', {
      memberId: \'mbr-test-01\',
      bloodGroup: \'AB+\',
      allergies: [\'Aspirin\', \'Contrast Dye\'],
      chronicConditions: [\'Asthma\'],
      active: true,
    });

    expect(ice.bloodGroup).toBe(\'AB+\');
    expect(ice.allergies).toContain(\'Aspirin\');

    dbStore.updateRow(\'IceProfile\', ice.id, {
      bloodGroup: \'O-\',
      allergies: [\'Aspirin\', \'Contrast Dye\', \'Latex\'],
    });

    const updated = dbStore.getRow(\'IceProfile\', ice.id);
    expect(updated?.bloodGroup).toBe(\'O-\');
    expect(updated?.allergies).toContain(\'Latex\');
  });
});
''')

print('Successfully created all files for apps/db-admin!')

