'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  type ColumnDef,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  EmptyState,
  cn,
} from '@poco/ui';
import {
  CreditCard,
  TrendingUp,
  AlertOctagon,
  Wallet,
  FileText,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { BillingTransactionType } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import {
  NegativeBalanceTable,
  type OverdraftHouseholdRow,
} from './components/negative-balance-table';
import {
  InvoiceViewerModal,
  type InvoiceStatement,
} from './components/invoice-viewer-modal';

export interface BillingOverviewData {
  mrrPaise: number; // e.g. 12500000 -> ₹125,000.00
  activeSubscriptionsCount: number;
  totalWalletBalancePaise: number;
  totalOverdraftDebtPaise: number;
  overdraftAccounts: OverdraftHouseholdRow[];
  recentTransactions: Array<{
    id: string;
    householdId: string;
    householdName: string;
    type: BillingTransactionType;
    amountPaise: number;
    description: string;
    createdAt: string;
  }>;
}

export function BillingDashboardView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'overdrafts' | 'ledger'>(
    'overview'
  );
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceStatement | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);

  const {
    data: billingData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<BillingOverviewData>({
    queryKey: ['admin-billing-overview'],
    queryFn: async () => {
      return apiClient.get<BillingOverviewData>('/api/admin/v1/billing/overview');
    },
    staleTime: 10000,
  });

  const mrrInr = ((billingData?.mrrPaise ?? 0) / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const walletInr = (
    (billingData?.totalWalletBalancePaise ?? 0) / 100
  ).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const debtInr = (
    (billingData?.totalOverdraftDebtPaise ?? 0) / 100
  ).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const transactionColumns: ColumnDef<any>[] = [
    {
      header: 'Transaction ID & Type',
      className: 'w-56',
      cell: (row) => (
        <div>
          <span className="text-[10px] font-mono text-slate-400 block">
            #{row.id.slice(0, 8)}
          </span>
          <Badge
            variant={
              row.type === BillingTransactionType.EMERGENCY_OVERDRAFT
                ? 'destructive'
                : row.type === BillingTransactionType.WALLET_CREDIT
                ? 'primary'
                : row.type === BillingTransactionType.QUOTA_DEBIT
                ? 'secondary'
                : 'outline'
            }
            className="text-[10px] font-bold"
          >
            {row.type}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Household',
      className: 'w-48',
      cell: (row) => (
        <span className="text-xs font-bold text-slate-800">{row.householdName}</span>
      ),
    },
    {
      header: 'Amount (₹)',
      className: 'w-36',
      cell: (row) => {
        const isCredit = row.type === BillingTransactionType.WALLET_CREDIT;
        const isNegative = row.type === BillingTransactionType.EMERGENCY_OVERDRAFT;
        return (
          <span
            className={cn(
              'text-xs font-bold font-mono',
              isCredit
                ? 'text-emerald-700'
                : isNegative
                ? 'text-rose-700'
                : 'text-slate-800'
            )}
          >
            {isCredit ? '+' : '-'}₹{(Math.abs(row.amountPaise) / 100).toFixed(2)}
          </span>
        );
      },
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-xs text-slate-600 truncate max-w-sm block">
          {row.description}
        </span>
      ),
    },
    {
      header: 'Date & Time',
      className: 'w-36 text-right',
      cell: (row) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Financial Billing & Overdraft Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor Monthly Recurring Revenue (MRR), household wallet liquidity, and emergency overdrafts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8 text-xs font-semibold"
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5 mr-1.5', isRefetching && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Recurring Revenue
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-[#12C395]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-extrabold text-slate-900 font-mono">₹{mrrInr}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {billingData?.activeSubscriptionsCount ?? 0} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Household Wallets
            </CardTitle>
            <Wallet className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-extrabold text-slate-900 font-mono">₹{walletInr}</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Customer prepaid balance
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Emergency Overdraft Debt
            </CardTitle>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-extrabold text-rose-700 font-mono">₹{debtInr}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {billingData?.overdraftAccounts?.length ?? 0} accounts in negative balance
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Invoices
            </CardTitle>
            <FileText className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold w-full mt-1"
              onClick={() => {
                setSelectedInvoice({
                  invoiceNumber: 'INV-2026-08-001',
                  billingMonth: 'August 2026',
                  householdName: 'Rao Household',
                  householdAddress: '14/2 Indiranagar',
                  city: 'Bengaluru',
                  subscriptionPlan: 'Standard Care Package (₹4,999/mo)',
                  subscriptionFeePaise: 499900,
                  walletTopUpsPaise: 200000,
                  itemizedServices: [
                    {
                      title: 'Bi-weekly Care Officer Visit (2 sessions)',
                      date: 'Aug 10 & Aug 24, 2026',
                      coveredByQuota: true,
                      costPaise: 0,
                    },
                    {
                      title: 'Emergency Medical SOS Transport',
                      date: 'Aug 15, 2026',
                      coveredByQuota: false,
                      costPaise: 150000,
                    },
                  ],
                  subtotalPaise: 649900,
                  gstPaise: 116982,
                  totalPaise: 766882,
                });
                setIsInvoiceModalOpen(true);
              }}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Sample Invoice Preview
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-4 py-1.5 text-xs font-bold rounded-lg transition-colors',
            activeTab === 'overview'
              ? 'bg-[#12C395] text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          Recent Transactions
        </button>
        <button
          onClick={() => setActiveTab('overdrafts')}
          className={cn(
            'px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5',
            activeTab === 'overdrafts'
              ? 'bg-[#12C395] text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <span>Emergency Overdrafts</span>
          {(billingData?.overdraftAccounts?.length ?? 0) > 0 && (
            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
              {billingData?.overdraftAccounts.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <DataTable
          columns={transactionColumns}
          data={billingData?.recentTransactions || []}
          isLoading={isLoading}
          emptyMessage="No billing transactions recorded."
        />
      )}

      {activeTab === 'overdrafts' && (
        <NegativeBalanceTable
          overdrafts={billingData?.overdraftAccounts || []}
          isLoading={isLoading}
          onRefresh={() => refetch()}
        />
      )}

      {/* Invoice Viewer Modal */}
      <InvoiceViewerModal
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        invoice={selectedInvoice}
      />
    </div>
  );
}

export default function BillingPage() {
  return <BillingDashboardView />;
}
