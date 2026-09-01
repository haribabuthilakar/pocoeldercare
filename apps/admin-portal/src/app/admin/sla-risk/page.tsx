'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  type ColumnDef,
  Badge,
  Button,
  EmptyState,
  cn,
} from '@poco/ui';
import { Clock, AlertTriangle, ShieldAlert, RefreshCw, ArrowUpRight } from 'lucide-react';
import { TicketPriority, TicketStatus, SlaStatus } from '@poco/constants';
import { apiClient } from '@/lib/api-client';

export interface SlaRiskRow {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaStatus: SlaStatus;
  triageSlaProgress?: number;
  deliverySlaProgress?: number;
  household: {
    name: string;
    city: string;
  };
  senior?: {
    name: string;
  } | null;
  assignedCareOfficer?: {
    name: string;
    phone: string;
  } | null;
  responseDueAt?: string;
  deliveryDueAt?: string;
}

function SlaRiskQueueView() {
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const {
    data: tickets = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<SlaRiskRow[]>({
    queryKey: ['admin-tickets-sla-risk'],
    queryFn: async () => {
      return apiClient.get<SlaRiskRow[]>('/api/admin/v1/tickets', {
        slaStatus: SlaStatus.AT_RISK,
      });
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const fallbackMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiClient.post(`/api/admin/v1/care-officers/tickets/${ticketId}/fallback`);
    },
    onSuccess: (data: any) => {
      setActionMessage('Supervisor fallback escalation triggered successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets-sla-risk'] });
    },
    onError: (err: any) => {
      setActionMessage(err?.message || 'Failed to trigger supervisor fallback.');
    },
  });

  const columns: ColumnDef<SlaRiskRow>[] = [
    {
      header: 'Priority & Status',
      className: 'w-36',
      cell: (row) => (
        <div className="space-y-1">
          <Badge
            variant={
              row.priority === TicketPriority.EMERGENCY
                ? 'destructive'
                : row.priority === TicketPriority.URGENT
                ? 'warning'
                : 'secondary'
            }
            className="text-[10px] font-bold"
          >
            {row.priority}
          </Badge>
          <div>
            <Badge
              variant={row.slaStatus === SlaStatus.BREACHED ? 'destructive' : 'warning'}
              className="text-[10px] font-bold"
            >
              {row.slaStatus.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: 'Ticket & Household',
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 text-xs">{row.title}</div>
          <div className="text-[11px] text-slate-500">
            {row.household.name} • {row.household.city}
            {row.senior && ` • Senior: ${row.senior.name}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Officer',
      className: 'w-44',
      cell: (row) =>
        row.assignedCareOfficer ? (
          <div>
            <div className="text-xs font-semibold text-slate-800">
              {row.assignedCareOfficer.name}
            </div>
            <div className="text-[10px] text-slate-400">
              {row.assignedCareOfficer.phone}
            </div>
          </div>
        ) : (
          <span className="text-xs text-rose-600 font-bold">Unassigned</span>
        ),
    },
    {
      header: 'Dual SLA Clocks',
      className: 'w-56',
      cell: (row) => {
        const triagePct = Math.round((row.triageSlaProgress ?? 0.8) * 100);
        const deliveryPct = Math.round((row.deliverySlaProgress ?? 0.75) * 100);

        return (
          <div className="space-y-1.5 text-[11px]">
            {/* Triage SLA */}
            <div className="flex items-center justify-between space-x-2">
              <span className="text-slate-500 font-medium">Triage:</span>
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    'font-bold px-1.5 py-0.2 rounded text-[10px]',
                    triagePct >= 100
                      ? 'bg-rose-100 text-rose-800 font-extrabold'
                      : triagePct >= 75
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {triagePct}% elapsed
                </span>
              </div>
            </div>

            {/* Delivery SLA */}
            <div className="flex items-center justify-between space-x-2">
              <span className="text-slate-500 font-medium">Delivery:</span>
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    'font-bold px-1.5 py-0.2 rounded text-[10px]',
                    deliveryPct >= 100
                      ? 'bg-rose-100 text-rose-800 font-extrabold'
                      : deliveryPct >= 75
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {deliveryPct}% elapsed
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Action',
      className: 'w-44 text-right',
      cell: (row) => {
        const isPending =
          fallbackMutation.isPending && fallbackMutation.variables === row.id;

        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
            isLoading={isPending}
            onClick={() => fallbackMutation.mutate(row.id)}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Escalate / Fallback
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            SLA At-Risk Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor dual timers (Triage & Delivery) and trigger supervisor escalation for at-risk tickets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">
            {isRefetching ? 'Updating timers...' : 'Live 5s Polling Active'}
          </span>
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

      {actionMessage && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {!isLoading && tickets.length === 0 ? (
        <EmptyState
          title="No At-Risk Clocks"
          description="All active service response and delivery timers are currently operating within normal thresholds."
          actionLabel="Refresh Queue"
          onAction={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          emptyMessage="No At-Risk Clocks: All active service response and delivery timers are currently operating within normal thresholds."
        />
      )}
    </div>
  );
}

export default function SlaRiskPage() {
  return <SlaRiskQueueView />;
}
