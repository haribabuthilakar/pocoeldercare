'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  cn,
} from '@poco/ui';
import { Database, ShieldAlert, RefreshCw, Key } from 'lucide-react';
import { UserRole } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import { useStaffUser } from '../providers';
import { RawTableViewer } from './components/raw-table-viewer';

const CORE_PRISMA_MODELS = [
  { id: 'households', label: 'Households' },
  { id: 'seniors', label: 'Seniors' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'service-requests', label: 'Service Requests' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'wallet-transactions', label: 'Transactions' },
  { id: 'care-officers', label: 'Care Officers' },
  { id: 'leads', label: 'Leads' },
  { id: 'audit-logs', label: 'Audit Logs' },
];

export interface PaginatedDbResponse {
  model: string;
  total: number;
  page: number;
  pageSize: number;
  records: Record<string, any>[];
}

function DatabaseExplorerView() {
  const { user } = useStaffUser();
  const [selectedModel, setSelectedModel] = React.useState('households');
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const isSuperAdmin = user.roles.includes(UserRole.SUPER_ADMIN);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<PaginatedDbResponse>({
    queryKey: ['admin-db-explorer', selectedModel, page],
    queryFn: async () => {
      return apiClient.get<PaginatedDbResponse>(
        `/api/admin/v1/database/${selectedModel}`,
        { page, pageSize }
      );
    },
    enabled: isSuperAdmin,
    staleTime: 5000,
  });

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white border border-rose-200 rounded-2xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900">
          Access Restricted — Super Administrator Only
        </h2>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
          Direct database inspection requires elevated SUPER_ADMIN privileges per security policy SEC-01.
        </p>
        <Badge variant="destructive">UNAUTHORIZED_ROLE</Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Raw Database Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic entity inspector with PII sanitization and server-side pagination.
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

      {/* Model Selection Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
        {CORE_PRISMA_MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg transition-all',
                isSelected
                  ? 'bg-[#12C395] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              )}
            >
              {model.label}
            </button>
          );
        })}
      </div>

      {/* Raw Table Viewer */}
      <RawTableViewer
        modelName={selectedModel}
        data={data?.records || []}
        totalRecords={data?.total || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default function DatabasePage() {
  return <DatabaseExplorerView />;
}
