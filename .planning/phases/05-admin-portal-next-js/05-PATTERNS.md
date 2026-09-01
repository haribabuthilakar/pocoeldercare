# Phase 05: Admin Portal (Next.js) - Architectural & Code Patterns

**Generated:** 2026-09-01  
**Status:** Approved  
**Target Surface:** `apps/admin-portal` (Next.js 15 App Router) & Shared Workspace Packages  

---

## 1. Monorepo Dependency Graph & Canonical Import Paths

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             @poco/admin-portal                              │
│                (apps/admin-portal/src/app/admin/*)                          │
└───────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────┘
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼
  @poco/ui       @poco/business-  @poco/validation  @poco/database  @poco/design-
                 rules                                              tokens
  (DataTable,    (Pure state      (Zod DTO          (Prisma client, (Colors,
   Badge, Card,   machines, SLA,   schemas, form     models, multi-  typography,
   Dialog, etc.)  billing, certs)  validators)       file schema)    spacing)
```

### Exact Workspace Import Statements

```typescript
// UI Components & Primitives
import {
  DataTable,
  ColumnDef,
  Badge,
  badgeVariants,
  Button,
  buttonVariants,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  EmptyState,
  FormField,
  Input,
  IceBadge,
  Skeleton,
  SkeletonCard,
  WizardStepper,
  Avatar,
  AvatarImage,
  AvatarFallback,
  cn
} from '@poco/ui';

// Pure Business Rules & State Machines
import {
  transitionTicket,
  calculateTicketRollupStatus,
  evaluateSlaStatus,
  validateCareOfficerAssignment,
  evaluateBillingAction,
  resolveServicePricing,
  validateLeadConversion,
  calculateGst,
  formatPaiseToInr,
  parseInrToPaise
} from '@poco/business-rules';

// Database Models & Enums
import {
  TicketStatus,
  ServiceRequestStatus,
  TicketPriority,
  SlaStatus,
  TriageStatus,
  UserRole,
  FamilyRole,
  LeadStage,
  SopProofType,
  PackageTier,
  BillingTransactionType,
  SubscriptionStatus,
  BillingCycle,
  CertificationStatus
} from '@poco/constants';
import { prisma, PrismaClient } from '@poco/database';
import type {
  Ticket,
  ServiceRequest,
  ServiceCatalog,
  ServiceCatalogVersion,
  Package,
  PackageVersion,
  Household,
  Senior,
  CareOfficerProfile,
  CareOfficerCertification,
  Lead,
  HouseholdWallet,
  WalletTransaction,
  AuditLog
} from '@poco/database';

// Zod Validation Schemas
import {
  assignCareOfficerSchema,
  reassignCareOfficerSchema,
  createLeadSchema,
  updateLeadStageSchema,
  createServiceCatalogVersionSchema
} from '@poco/validation';
import type {
  AssignCareOfficerDto,
  ReassignCareOfficerDto,
  CreateLeadDto,
  UpdateLeadStageDto,
  CreateServiceCatalogVersionDto
} from '@poco/validation';

// Integration Diagnostics & Stubs
import {
  mockPartnerRegistry,
  getMockSettings,
  updateMockSettings,
  resetAllMockSettings
} from '@poco/integrations';
import type { MockSettings, PartnerCode } from '@poco/integrations';
```

---

## 2. Omni-Role Navigation Shell & Staff Auth Pattern

### Context & Design Decision (D-01, AUTH-02, AUTH-06)
Internal staff members may hold multiple concurrent roles (e.g. `CARE_OFFICER` + `CARE_MANAGER` + `OPS_MANAGER`). Rather than forcing context switching between portals, the omni-role shell layout computes the union of all permitted navigation items and renders role badge chips in the header.

### Shell Layout Implementation Pattern

```tsx
// apps/admin-portal/src/app/admin/layout.tsx
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  AlertOctagon,
  Clock,
  Users,
  Layers,
  UserPlus,
  CreditCard,
  Database,
  Activity,
  LogOut,
  Shield
} from 'lucide-react';
import { Badge, Avatar, AvatarFallback, cn } from '@poco/ui';
import { UserRole } from '@poco/constants';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badgeCountKey?: 'pendingTriage' | 'waitingOps' | 'slaAtRisk';
}

const ADMIN_NAVIGATION: NavItem[] = [
  // Operations Executive / Ops Manager
  {
    label: 'Pending Triage',
    href: '/admin/triage',
    icon: Inbox,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
    badgeCountKey: 'pendingTriage'
  },
  {
    label: 'Rollup Exceptions',
    href: '/admin/exceptions',
    icon: AlertOctagon,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
    badgeCountKey: 'waitingOps'
  },
  {
    label: 'SLA At Risk',
    href: '/admin/sla-risk',
    icon: Clock,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
    badgeCountKey: 'slaAtRisk'
  },
  // Care Officer Manager
  {
    label: 'Care Officers Roster',
    href: '/admin/care-officers',
    icon: Users,
    roles: [UserRole.CARE_MANAGER, UserRole.SUPER_ADMIN]
  },
  // Service Catalog & Packages
  {
    label: 'Service Catalog',
    href: '/admin/catalog',
    icon: Layers,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN]
  },
  // Sales & Leads
  {
    label: 'Lead Pipeline',
    href: '/admin/leads',
    icon: UserPlus,
    roles: [UserRole.SALES_LEAD, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN]
  },
  // Finance & Billing
  {
    label: 'Billing & Overdrafts',
    href: '/admin/billing',
    icon: CreditCard,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN]
  },
  // Diagnostics & Raw DB
  {
    label: 'Database Explorer',
    href: '/admin/database',
    icon: Database,
    roles: [UserRole.SUPER_ADMIN]
  },
  {
    label: 'Partner Integrations',
    href: '/admin/integrations',
    icon: Activity,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN]
  }
];

export function AdminShellLayout({
  children,
  currentUser
}: {
  children: React.ReactNode;
  currentUser: { name: string; email: string; roles: UserRole[] };
}) {
  const pathname = usePathname();

  // Compute allowed navigation items across union of all assigned roles
  const allowedNav = ADMIN_NAVIGATION.filter((item) =>
    item.roles.some((role) => currentUser.roles.includes(role))
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-[#0F172A] text-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#12C395] flex items-center justify-center text-slate-950 font-bold">
            P
          </div>
          <span className="font-bold text-base text-white tracking-tight">Poco Operations</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors select-none',
                  isActive
                    ? 'bg-[#12C395] text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Card */}
        <div className="p-4 border-t border-slate-800 flex items-center space-x-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-slate-800 text-slate-200 text-xs">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar with Role Chips */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">Active Roles:</span>
            {currentUser.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-[11px] py-0.5">
                {role.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

---

## 3. High-Density Operations Queue & TanStack Query Polling Pattern

### Direct 5-Second Client-Side Polling (D-02, D-07, ADMN-01, ADMN-02, TCKT-02)

To satisfy the 1GB DO droplet RAM constraint while providing fresh operational updates without WebSocket connection bloat, queues use TanStack Query with `refetchInterval: 5000`.

```tsx
// apps/admin-portal/src/app/admin/triage/page.tsx
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  ColumnDef,
  Badge,
  Button,
  IceBadge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  EmptyState,
  FormField,
  cn
} from '@poco/ui';
import { Sparkles, Check, Edit2, AlertTriangle, RefreshCw } from 'lucide-react';
import { TicketPriority, TicketStatus, TriageStatus } from '@poco/constants';
import type { Ticket, ServiceRequest } from '@poco/database';

interface TriageQueueRow extends Ticket {
  household: { name: string; city: string };
  senior?: { name: string } | null;
  serviceRequests: Array<ServiceRequest & { serviceCatalogVersion: { serviceCatalog: { name: string } } }>;
  suggestedServiceVersionId?: string;
  suggestedServiceName?: string;
  aiConfidenceScore?: number;
}

export function OperationsTriageQueuePage() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = React.useState<TriageQueueRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // TanStack 5-second polling hook
  const { data: tickets = [], isLoading, isRefetching, refetch } = useQuery<TriageQueueRow[]>({
    queryKey: ['admin-tickets-triage'],
    queryFn: async () => {
      const res = await fetch('/api/admin/v1/tickets?triageStatus=PENDING_TRIAGE');
      if (!res.ok) throw new Error('Failed to fetch triage queue');
      return res.json();
    },
    refetchInterval: 5000,
    staleTime: 4000
  });

  // 1-Click Inline Quick Approve Mutation
  const quickApproveMutation = useMutation({
    mutationFn: async ({ ticketId, versionId }: { ticketId: string; versionId: string }) => {
      const res = await fetch(`/api/admin/v1/tickets/${ticketId}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ serviceCatalogVersionId: versionId, notes: 'Quick-approved AI suggestion' }]
        })
      });
      if (!res.ok) throw new Error('Failed to approve ticket');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets-triage'] });
    }
  });

  const columns: ColumnDef<TriageQueueRow>[] = [
    {
      header: 'Priority',
      accessorKey: 'priority',
      className: 'w-28',
      cell: (row) => (
        <Badge
          variant={
            row.priority === TicketPriority.EMERGENCY
              ? 'accent'
              : row.priority === TicketPriority.URGENT
              ? 'warning'
              : 'secondary'
          }
        >
          {row.priority}
        </Badge>
      )
    },
    {
      header: 'Ticket & Household',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{row.title}</div>
          <div className="text-xs text-slate-500">
            {row.household.name} • {row.household.city}
            {row.senior && ` • Senior: ${row.senior.name}`}
          </div>
        </div>
      )
    },
    {
      header: 'AI Suggested Service',
      cell: (row) => {
        const confidence = row.aiConfidenceScore ?? 0.85;
        const isHighConfidence = confidence >= 0.75;
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={isHighConfidence ? 'primary' : 'warning'} className="text-[11px]">
              <Sparkles className="w-3 h-3 mr-1" />
              {row.suggestedServiceName || 'General Elder Visit'} ({(confidence * 100).toFixed(0)}%)
            </Badge>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      className: 'w-48 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-2">
          {row.suggestedServiceVersionId && (
            <Button
              size="sm"
              variant="primary"
              className="h-8 px-3 text-xs"
              isLoading={quickApproveMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                quickApproveMutation.mutate({
                  ticketId: row.id,
                  versionId: row.suggestedServiceVersionId!
                });
              }}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Quick Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs"
            onClick={() => {
              setSelectedTicket(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Triage Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming AI-classified tickets and convert them into immutable service requests.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">
            {isRefetching ? 'Updating queue...' : 'Live 5s Polling Active'}
          </span>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-xs">
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', isRefetching && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        emptyMessage="No Pending Tickets: All incoming tickets and AI-classified messages have been triaged."
      />
    </div>
  );
}
```

---

## 4. Rollup Exception Reconciliation Tree Pattern

### Visual Hierarchical Conflict Modal (D-05, TCKT-07, ADMN-02)

When child service requests enter `EXCEPTION` or conflicting terminal states, the parent ticket is held in `WAITING_OPS_UPDATE`. The exception resolution modal displays the parent ticket and indented tree of child requests with conflict badges.

```tsx
// apps/admin-portal/src/app/admin/exceptions/components/rollup-resolution-modal.tsx
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
  FormField,
  cn
} from '@poco/ui';
import { AlertTriangle } from 'lucide-react';
import { ServiceRequestStatus } from '@poco/constants';

interface ChildRequestNode {
  id: string;
  serviceName: string;
  status: ServiceRequestStatus;
  notes?: string;
}

interface RollupResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketTitle: string;
  childRequests: ChildRequestNode[];
  onResolve: (action: 'RESUME_IN_PROGRESS' | 'RESOLVE' | 'CANCEL', notes: string) => Promise<void>;
}

export function RollupResolutionModal({
  open,
  onOpenChange,
  ticketId,
  ticketTitle,
  childRequests,
  onResolve
}: RollupResolutionModalProps) {
  const [selectedAction, setSelectedAction] = React.useState<'RESUME_IN_PROGRESS' | 'RESOLVE' | 'CANCEL'>('RESOLVE');
  const [resolutionNotes, setResolutionNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await onResolve(selectedAction, resolutionNotes);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Reconcile Rollup Exception</span>
          </DialogTitle>
          <DialogDescription>
            Ticket #{ticketId.slice(0, 8)} — {ticketTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Hierarchical Child Request Status Tree */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Child Service Requests ({childRequests.length})
            </div>
            {childRequests.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-800">{child.serviceName}</span>
                </div>
                <Badge
                  variant={
                    child.status === ServiceRequestStatus.COMPLETED
                      ? 'primary'
                      : child.status === ServiceRequestStatus.EXCEPTION
                      ? 'warning'
                      : 'destructive'
                  }
                  className="text-[10px]"
                >
                  {child.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Rollup Resolution Action Selector */}
          <FormField label="Target Rollup Transition" required>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('RESOLVE')}
                className={cn(
                  'p-2.5 text-xs font-bold rounded-xl border transition-all text-center',
                  selectedAction === 'RESOLVE'
                    ? 'border-[#12C395] bg-emerald-50 text-[#0E8164] ring-2 ring-[#12C395]/20'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                Resolve Ticket
              </button>
              <button
                type="button"
                onClick={() => setSelectedAction('RESUME_IN_PROGRESS')}
                className={cn(
                  'p-2.5 text-xs font-bold rounded-xl border transition-all text-center',
                  selectedAction === 'RESUME_IN_PROGRESS'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                Resume Progress
              </button>
              <button
                type="button"
                onClick={() => setSelectedAction('CANCEL')}
                className={cn(
                  'p-2.5 text-xs font-bold rounded-xl border transition-all text-center',
                  selectedAction === 'CANCEL'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                Cancel Ticket
              </button>
            </div>
          </FormField>

          {/* Mandatory Resolution Note */}
          <FormField label="Operations Resolution Audit Note" required>
            <textarea
              required
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain the exception reconciliation rationale (recorded in immutable audit log)..."
              className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            />
          </FormField>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!resolutionNotes.trim()}
            >
              Resolve Rollup Exception
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5. Care Officer Assignment & Automated Certification Gating Pattern

### Pure Rule Validation & Manager Bypass (D-08, D-09, CARE-02, CARE-03, ADMN-03)

The assignment studio uses `@poco/business-rules` `validateCareOfficerAssignment`. If an officer is missing unexpired certificates, the submit button is disabled (`Officer Ineligible`). If the caller has `CARE_MANAGER` or `SUPER_ADMIN` role, an override checkbox enables temporary assignment with mandatory security audit logging.

```tsx
// apps/admin-portal/src/app/admin/care-officers/components/assignment-modal.tsx
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Badge,
  FormField,
  Input
} from '@poco/ui';
import { ShieldAlert } from 'lucide-react';
import { UserRole } from '@poco/constants';
import { validateCareOfficerAssignment } from '@poco/business-rules';

interface OfficerCandidate {
  id: string;
  name: string;
  isAvailable: boolean;
  certifications: Array<{
    certificationCode: string;
    expiresAt: Date;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  }>;
}

interface AssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  household: { id: string; name: string; assignedCareOfficerId?: string | null };
  officers: OfficerCandidate[];
  callerRoles: UserRole[];
  requiredCerts: string[];
  onAssign: (officerId: string, managerOverride: boolean, overrideReason?: string) => Promise<void>;
}

export function CareOfficerAssignmentModal({
  open,
  onOpenChange,
  household,
  officers,
  callerRoles,
  requiredCerts,
  onAssign
}: AssignmentModalProps) {
  const [selectedOfficerId, setSelectedOfficerId] = React.useState<string>('');
  const [isManagerOverride, setIsManagerOverride] = React.useState(false);
  const [overrideReason, setOverrideReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId);

  // Validate candidate against pure business rule
  const validationResult = React.useMemo(() => {
    if (!selectedOfficer) return null;
    return validateCareOfficerAssignment(
      callerRoles,
      household,
      selectedOfficer,
      requiredCerts
    );
  }, [selectedOfficer, callerRoles, household, requiredCerts]);

  const isEligible = validationResult?.ok === true;
  const isManager = callerRoles.includes(UserRole.CARE_MANAGER) || callerRoles.includes(UserRole.SUPER_ADMIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    if (!isEligible && (!isManager || !isManagerOverride || !overrideReason.trim())) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedOfficerId, isManagerOverride, overrideReason);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Care Officer to Household</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <FormField label="Target Household">
            <Input value={household.name} disabled className="bg-slate-100 font-semibold" />
          </FormField>

          <FormField label="Select Care Officer" required>
            <select
              value={selectedOfficerId}
              onChange={(e) => {
                setSelectedOfficerId(e.target.value);
                setIsManagerOverride(false);
                setOverrideReason('');
              }}
              className="w-full h-11 text-sm rounded-xl border border-slate-300 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            >
              <option value="">-- Choose an Officer --</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} {o.isAvailable ? '(Available)' : '(Unavailable)'}
                </option>
              ))}
            </select>
          </FormField>

          {/* Validation Feedback */}
          {selectedOfficer && validationResult && !validationResult.ok && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Officer Ineligible: Missing Mandatory Certifications</span>
              </div>
              <p className="text-xs text-rose-700">{validationResult.error.message}</p>

              {/* Authorized Manager Override Checkbox */}
              {isManager && (
                <div className="pt-2 border-t border-rose-200/60 mt-2 space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-bold text-rose-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isManagerOverride}
                      onChange={(e) => setIsManagerOverride(e.target.checked)}
                      className="rounded border-rose-400 text-[#12C395] focus:ring-[#12C395]"
                    />
                    <span>Manager Override (Exceptional Temporary Assignment)</span>
                  </label>

                  {isManagerOverride && (
                    <textarea
                      required
                      rows={2}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Enter mandatory security audit rationale for bypass..."
                      className="w-full text-xs rounded-lg border border-rose-300 p-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={
                !selectedOfficerId ||
                (!isEligible && (!isManager || !isManagerOverride || !overrideReason.trim()))
              }
            >
              Assign Care Officer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Service Catalog & Package Versioning Studio Pattern

### Immutable Rate Card Bumping (D-12, D-13, CATL-01..05)

When saving rate card changes, the backend increments `versionNumber++` and sets `effectiveFrom = new Date()`. Historical records remain unmodified so grandfathered subscriptions continue paying original rates.

```tsx
// apps/admin-portal/src/app/admin/catalog/components/service-version-form.tsx
import * as React from 'react';
import { Button, FormField, Input } from '@poco/ui';
import { SopProofType } from '@poco/constants';
import { createServiceCatalogVersionSchema } from '@poco/validation';

interface ServiceVersionFormProps {
  catalogId: string;
  catalogName: string;
  currentVersionNumber: number;
  currentPricePaise: number;
  onPublish: (data: {
    pricePaise: number;
    estimatedDurationMinutes: number;
    requiredCertifications: string[];
    sopSteps: Array<{ stepOrder: number; title: string; proofType: SopProofType; isRequired: boolean }>;
  }) => Promise<void>;
}

export function ServiceVersionEditorForm({
  catalogId,
  catalogName,
  currentVersionNumber,
  currentPricePaise,
  onPublish
}: ServiceVersionFormProps) {
  const [priceRupees, setPriceRupees] = React.useState((currentPricePaise / 100).toString());
  const [durationMinutes, setDurationMinutes] = React.useState('60');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const pricePaise = Math.round(parseFloat(priceRupees) * 100);

    setIsSubmitting(true);
    try {
      await onPublish({
        pricePaise,
        estimatedDurationMinutes: parseInt(durationMinutes, 10),
        requiredCertifications: ['GERIATRIC_CORE'],
        sopSteps: [
          { stepOrder: 1, title: 'Arrival & Greeting', proofType: SopProofType.NONE, isRequired: true },
          { stepOrder: 2, title: 'Perform Vital Check', proofType: SopProofType.CHOICE, isRequired: true },
          { stepOrder: 3, title: 'Upload Visit Photo', proofType: SopProofType.PHOTO, isRequired: false }
        ]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePublish} className="space-y-4 max-w-xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Publish New Version: {catalogName}</h3>
        <p className="text-xs text-slate-500">
          Will bump version to v{currentVersionNumber + 1}. Existing active subscriptions will retain grandfathered pricing.
        </p>
      </div>

      <FormField label="Base Unit Price (₹ INR)" required hint={`Stored as ${Math.round(parseFloat(priceRupees || '0') * 100)} paise`}>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={priceRupees}
          onChange={(e) => setPriceRupees(e.target.value)}
          required
        />
      </FormField>

      <FormField label="Estimated Duration (Minutes)" required>
        <Input
          type="number"
          min="5"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
        />
      </FormField>

      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <Button type="submit" variant="primary" size="default" isLoading={isSubmitting}>
          Publish New Catalog Version (v{currentVersionNumber + 1})
        </Button>
      </div>
    </form>
  );
}
```

---

## 7. Raw Database Explorer & Audit Inspector Pattern

### Paginated Entity Inspection (D-16, ADMN-05)

The database explorer provides a tabbed view across core Prisma entities with column sorting, server-side pagination, and collapsible monospace JSON blocks for nested objects.

```tsx
// apps/admin-portal/src/app/admin/database/page.tsx
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, ColumnDef, Button, cn } from '@poco/ui';

type EntityTable = 'users' | 'households' | 'tickets' | 'wallets' | 'audit_logs';

export function DatabaseExplorerPage() {
  const [activeTable, setActiveTable] = React.useState<EntityTable>('tickets');
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-raw-db', activeTable, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/v1/database/${activeTable}?page=${page}&limit=${pageSize}`);
      return res.json();
    }
  });

  const columns: ColumnDef<any>[] = React.useMemo(() => {
    if (!data?.items?.[0]) return [];
    return Object.keys(data.items[0]).map((key) => ({
      header: key,
      accessorKey: key,
      cell: (row) => {
        const val = row[key];
        if (val === null || val === undefined) return <span className="text-slate-300 italic">null</span>;
        if (typeof val === 'object') {
          return (
            <details className="cursor-pointer">
              <summary className="text-[11px] font-mono text-emerald-600 truncate max-w-[180px]">
                {JSON.stringify(val).slice(0, 30)}...
              </summary>
              <pre className="mt-1 p-2 bg-slate-900 text-slate-100 text-[10px] font-mono rounded max-w-sm overflow-auto">
                {JSON.stringify(val, null, 2)}
              </pre>
            </details>
          );
        }
        return <span className="font-mono text-xs">{String(val)}</span>;
      }
    }));
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Database Entity Explorer</h1>
        <span className="text-xs text-slate-400 font-mono">Read-Only Diagnostic Inspector</span>
      </div>

      {/* Horizontal Model Tab Bar */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {(['tickets', 'households', 'users', 'wallets', 'audit_logs'] as EntityTable[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTable(tab);
              setPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all',
              activeTable === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
      />
    </div>
  );
}
```

---

## 8. Automated Testing & Verification Pattern

### Pure Business Rule Tests & Playwright Scenario Matrix

```typescript
// packages/business-rules/test/assignments.spec.ts
import { describe, it, expect } from 'vitest';
import { validateCareOfficerAssignment } from '../src/assignments/validator';
import { UserRole } from '@poco/constants';

describe('validateCareOfficerAssignment', () => {
  const household = { id: 'hh-1', assignedCareOfficerId: null };

  it('blocks assignment if officer has expired BLS certification', () => {
    const candidateOfficer = {
      id: 'co-1',
      isAvailable: true,
      certifications: [
        {
          certificationCode: 'BLS_CPR',
          expiresAt: new Date(Date.now() - 100000), // Expired
          status: 'EXPIRED' as const
        }
      ]
    };

    const result = validateCareOfficerAssignment(
      [UserRole.CARE_MANAGER],
      household,
      candidateOfficer,
      ['BLS_CPR']
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CERTIFICATION_MISSING_OR_EXPIRED');
    }
  });

  it('permits assignment when officer holds active certifications', () => {
    const candidateOfficer = {
      id: 'co-2',
      isAvailable: true,
      certifications: [
        {
          certificationCode: 'BLS_CPR',
          expiresAt: new Date(Date.now() + 10000000),
          status: 'ACTIVE' as const
        }
      ]
    };

    const result = validateCareOfficerAssignment(
      [UserRole.CARE_MANAGER],
      household,
      candidateOfficer,
      ['BLS_CPR']
    );

    expect(result.ok).toBe(true);
  });
});
```

---

## PATTERN MAPPING COMPLETE
