'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  type ColumnDef,
  Badge,
  Button,
  IceBadge,
  EmptyState,
  cn,
} from '@poco/ui';
import { Sparkles, Check, Edit2, RefreshCw, AlertTriangle, Flame } from 'lucide-react';
import { TicketPriority, TicketStatus, TriageStatus } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import { TriageEditModal } from './components/triage-edit-modal';

export interface TriageTicketRow {
  id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  triageStatus: TriageStatus;
  isEmergency?: boolean;
  householdId: string;
  seniorId?: string | null;
  household: {
    name: string;
    city: string;
  };
  senior?: {
    name: string;
  } | null;
  suggestedServiceVersionId?: string;
  suggestedServiceName?: string;
  aiConfidenceScore?: number;
  createdAt: string;
}

function OperationsTriageQueueView() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = React.useState<TriageTicketRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // TanStack 5-second polling hook
  const {
    data: tickets = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<TriageTicketRow[]>({
    queryKey: ['admin-tickets-triage'],
    queryFn: async () => {
      return apiClient.get<TriageTicketRow[]>('/api/admin/v1/tickets', {
        triageStatus: TriageStatus.PENDING_TRIAGE,
      });
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });

  // 1-Click Inline Quick Approve Mutation
  const quickApproveMutation = useMutation({
    mutationFn: async ({
      ticketId,
      versionId,
      isEmergency,
    }: {
      ticketId: string;
      versionId: string;
      isEmergency?: boolean;
    }) => {
      return apiClient.post(`/api/admin/v1/tickets/${ticketId}/triage`, {
        items: [
          {
            serviceCatalogVersionId: versionId,
            notes: 'Quick-approved AI suggestion from triage queue',
          },
        ],
        isEmergency,
      });
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets-triage'] });
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to approve ticket.');
    },
  });

  const columns: ColumnDef<TriageTicketRow>[] = [
    {
      header: 'Priority',
      accessorKey: 'priority',
      className: 'w-32',
      cell: (row) => {
        const isEmergency = row.priority === TicketPriority.EMERGENCY || row.isEmergency;
        if (isEmergency) {
          return (
            <div className="flex items-center space-x-1">
              <Badge variant="destructive" className="text-[11px] font-bold py-0.5 bg-rose-600 text-white flex items-center space-x-1">
                <Flame className="w-3 h-3 mr-0.5 animate-bounce" />
                <span>EMERGENCY</span>
              </Badge>
            </div>
          );
        }
        if (row.priority === TicketPriority.URGENT) {
          return (
            <Badge variant="warning" className="text-[11px] font-semibold py-0.5">
              URGENT
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="text-[11px] font-medium py-0.5">
            NORMAL
          </Badge>
        );
      },
    },
    {
      header: 'Ticket & Household',
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 text-xs flex items-center space-x-2">
            <span>{row.title}</span>
            {row.isEmergency && (
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                Fall / SOS Alert
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            {row.household.name} • {row.household.city}
            {row.senior && ` • Senior: ${row.senior.name}`}
          </div>
        </div>
      ),
    },
    {
      header: 'AI Suggested Service',
      cell: (row) => {
        const confidence = row.aiConfidenceScore ?? 0.85;
        const isHighConfidence = confidence >= 0.75;
        return (
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border',
                isHighConfidence
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              )}
            >
              <Sparkles className="w-3 h-3 mr-1 text-[#12C395]" />
              <span>{row.suggestedServiceName || 'General Elder Care Visit'}</span>
              <span className="ml-1 opacity-80">({(confidence * 100).toFixed(0)}%)</span>
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      className: 'w-48 text-right',
      cell: (row) => {
        const isPendingThis =
          quickApproveMutation.isPending &&
          quickApproveMutation.variables?.ticketId === row.id;

        return (
          <div className="flex items-center justify-end space-x-2">
            {row.suggestedServiceVersionId && (
              <Button
                size="sm"
                variant="primary"
                className="h-8 px-3 text-xs bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
                isLoading={isPendingThis}
                onClick={(e) => {
                  e.stopPropagation();
                  quickApproveMutation.mutate({
                    ticketId: row.id,
                    versionId: row.suggestedServiceVersionId!,
                    isEmergency: row.isEmergency,
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
              aria-label={`Edit ticket ${row.id}`}
              className="h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setSelectedTicket(row);
                setIsEditModalOpen(true);
              }}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operations Triage Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming AI-classified tickets and convert them into immutable service requests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">
            {isRefetching ? 'Updating queue...' : 'Live 5s Polling Active'}
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

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Table or Empty State */}
      {!isLoading && tickets.length === 0 ? (
        <EmptyState
          title="No Pending Tickets"
          description="All incoming tickets and AI-classified messages have been triaged. Check back shortly or refresh."
          actionLabel="Refresh Queue"
          onAction={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          emptyMessage="No Pending Tickets: All incoming tickets and AI-classified messages have been triaged. Check back shortly or refresh."
        />
      )}

      {/* Triage Customization Edit Modal */}
      <TriageEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        ticket={selectedTicket}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-tickets-triage'] });
        }}
      />
    </div>
  );
}

export default function OperationsTriagePage() {
  return <OperationsTriageQueueView />;
}
