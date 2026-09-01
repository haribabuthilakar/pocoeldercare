'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  ColumnDef,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  EmptyState,
} from '@poco/ui';
import {
  Cpu,
  AlertOctagon,
  CheckCircle2,
  RotateCw,
  Trash2,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface FailedJobRow {
  id: string;
  name: string;
  data?: any;
  output?: any;
  retryCount: number;
  failedAt: string;
  errorMessage: string;
  errorStack?: string;
}

export interface PgBossQueueStatus {
  activeCount: number;
  completed24hCount: number;
  failedCount: number;
  failedJobs: FailedJobRow[];
}

export function PgBossInspector() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = React.useState<FailedJobRow | null>(null);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const {
    data: queueStatus,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<PgBossQueueStatus>({
    queryKey: ['admin-pgboss-jobs'],
    queryFn: async () => {
      return apiClient.get<PgBossQueueStatus>('/api/admin/v1/integrations/jobs');
    },
    staleTime: 5000,
  });

  const retryMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiClient.post(`/api/admin/v1/integrations/jobs/${jobId}/retry`);
    },
    onSuccess: () => {
      setActionMessage('Job scheduled for immediate re-execution.');
      queryClient.invalidateQueries({ queryKey: ['admin-pgboss-jobs'] });
    },
    onError: (err: any) => {
      setActionMessage(`Retry failed: ${err?.message}`);
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/api/admin/v1/integrations/jobs/purge');
    },
    onSuccess: (data: any) => {
      setActionMessage('All failed jobs purged successfully from pg-boss queue.');
      setIsPurgeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-pgboss-jobs'] });
    },
    onError: (err: any) => {
      setActionMessage(`Purge failed: ${err?.message}`);
    },
  });

  const columns: ColumnDef<FailedJobRow>[] = [
    {
      header: 'Job Name & ID',
      className: 'w-64',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-xs text-slate-900">{row.name}</div>
          <div className="font-mono text-[10px] text-slate-400">#{row.id.slice(0, 12)}</div>
        </div>
      ),
    },
    {
      header: 'Error Description',
      cell: (row) => (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 p-2 rounded-lg font-mono truncate max-w-md">
          {row.errorMessage || 'Job execution terminated with unhandled exception.'}
        </div>
      ),
    },
    {
      header: 'Retries',
      className: 'w-24 text-center',
      cell: (row) => (
        <Badge variant="warning" className="text-[10px] font-bold">
          {row.retryCount} tries
        </Badge>
      ),
    },
    {
      header: 'Failed At',
      className: 'w-36',
      cell: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {new Date(row.failedAt).toLocaleTimeString()}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'w-36 text-right',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2"
          isLoading={retryMutation.isPending && retryMutation.variables === row.id}
          onClick={() => retryMutation.mutate(row.id)}
        >
          <RotateCw className="w-3 h-3 mr-1 text-slate-600" />
          Retry Failed Job
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active In-Process Jobs
            </CardTitle>
            <Cpu className="w-4 h-4 text-[#12C395]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {queueStatus?.activeCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Running on Droplet (1GB cap)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Jobs (24h)
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">
              {queueStatus?.completed24hCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated queue tasks</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Failed Jobs
            </CardTitle>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-rose-700 font-mono">
              {queueStatus?.failedCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Requires ops attention or retry</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Failed Background Job Queue ({queueStatus?.failedJobs?.length ?? 0})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {(queueStatus?.failedJobs?.length ?? 0) > 0 && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700"
              onClick={() => setIsPurgeModalOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Purge Failed Jobs
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8 text-xs font-semibold"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`}
            />
            Refresh Queue
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table or Empty State */}
      {!isLoading && (queueStatus?.failedJobs?.length ?? 0) === 0 ? (
        <EmptyState
          title="No Failed Background Jobs"
          description="The pg-boss job queue is operating cleanly with zero failed tasks."
          actionLabel="Run Health Check"
          onAction={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={queueStatus?.failedJobs || []}
          isLoading={isLoading}
          emptyMessage="No Failed Background Jobs: The pg-boss job queue is operating cleanly with zero failed tasks."
        />
      )}

      {/* Destructive Purge Confirmation Modal */}
      <Dialog open={isPurgeModalOpen} onOpenChange={setIsPurgeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-rose-600 text-base">
              <AlertOctagon className="w-5 h-5" />
              <span>Purge Failed Jobs Confirmation</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Purge Failed Jobs: Are you sure you want to delete {queueStatus?.failedCount ?? 0} failed pg-boss queue jobs? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPurgeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={purgeMutation.isPending}
              onClick={() => purgeMutation.mutate()}
            >
              Confirm Purge All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
