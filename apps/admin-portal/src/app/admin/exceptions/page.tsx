'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  type ColumnDef,
  Badge,
  Button,
  EmptyState,
  cn,
} from '@poco/ui';
import { AlertOctagon, RefreshCw, GitMerge } from 'lucide-react';
import { TicketPriority, TicketStatus, ServiceRequestStatus } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import {
  RollupResolutionModal,
  type ChildRequestNode,
} from './components/rollup-resolution-modal';

export interface RollupExceptionRow {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  stallReason?: string;
  household: {
    name: string;
    city: string;
  };
  serviceRequests: Array<{
    id: string;
    title?: string;
    status: ServiceRequestStatus;
    serviceCatalogVersion?: {
      serviceCatalog: {
        name: string;
      };
    };
  }>;
}

export function RollupExceptionsQueueView() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = React.useState<RollupExceptionRow | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const {
    data: tickets = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<RollupExceptionRow[]>({
    queryKey: ['admin-tickets-exceptions'],
    queryFn: async () => {
      return apiClient.get<RollupExceptionRow[]>('/api/admin/v1/tickets', {
        status: TicketStatus.WAITING_OPS_UPDATE,
      });
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const columns: ColumnDef<RollupExceptionRow>[] = [
    {
      header: 'Ticket ID & Priority',
      className: 'w-36',
      cell: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-slate-900">
            #{row.id.slice(0, 8)}
          </span>
          <div>
            <Badge
              variant={
                row.priority === TicketPriority.EMERGENCY
                  ? 'destructive'
                  : row.priority === TicketPriority.URGENT
                  ? 'warning'
                  : 'secondary'
              }
              className="text-[10px] font-semibold"
            >
              {row.priority}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: 'Household & Title',
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 text-xs">{row.title}</div>
          <div className="text-[11px] text-slate-500">
            {row.household.name} • {row.household.city}
          </div>
        </div>
      ),
    },
    {
      header: 'Conflicting Requests',
      className: 'w-44',
      cell: (row) => {
        const total = row.serviceRequests?.length || 0;
        const exceptions =
          row.serviceRequests?.filter(
            (sr) => sr.status === ServiceRequestStatus.EXCEPTION
          ).length || 0;

        return (
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-800">{total} child requests</span>
            {exceptions > 0 && (
              <Badge variant="warning" className="text-[10px] py-0">
                {exceptions} exception
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: 'Stall Reason',
      cell: (row) => (
        <div className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/60 p-2 rounded-lg max-w-md truncate">
          {row.stallReason || 'Conflicting child service request status resolution required.'}
        </div>
      ),
    },
    {
      header: 'Action',
      className: 'w-36 text-right',
      cell: (row) => (
        <Button
          size="sm"
          variant="primary"
          className="h-8 px-3 text-xs bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
          onClick={() => {
            setSelectedTicket(row);
            setIsModalOpen(true);
          }}
        >
          <GitMerge className="w-3.5 h-3.5 mr-1" />
          Resolve Rollup
        </Button>
      ),
    },
  ];

  const formattedChildRequests: ChildRequestNode[] =
    selectedTicket?.serviceRequests?.map((sr) => ({
      id: sr.id,
      title: sr.title,
      serviceName:
        sr.title || sr.serviceCatalogVersion?.serviceCatalog?.name || 'Service Request',
      status: sr.status,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Rollup Exceptions Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve stalled tickets whose child service requests entered conflicting or exception states.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">
            {isRefetching ? 'Updating exceptions...' : 'Live 5s Polling Active'}
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

      {!isLoading && tickets.length === 0 ? (
        <EmptyState
          title="No Rollup Conflicts"
          description="All child service requests have reconciled cleanly to their parent tickets."
          actionLabel="Refresh Queue"
          onAction={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          emptyMessage="No Rollup Conflicts: All child service requests have reconciled cleanly to their parent tickets."
        />
      )}

      {selectedTicket && (
        <RollupResolutionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          ticketId={selectedTicket.id}
          ticketTitle={selectedTicket.title}
          stallReason={selectedTicket.stallReason}
          childRequests={formattedChildRequests}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets-exceptions'] });
          }}
        />
      )}
    </div>
  );
}

export default function RollupExceptionsPage() {
  return <RollupExceptionsQueueView />;
}
