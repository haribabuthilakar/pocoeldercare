'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  DataTable,
  type ColumnDef,
  Badge,
  Button,
  EmptyState,
} from '@poco/ui';
import { AlertCircle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface OverdraftHouseholdRow {
  householdId: string;
  householdName: string;
  city: string;
  primaryContactPhone: string;
  negativeBalancePaise: number; // e.g. -150000 -> -₹1,500.00
  lastEmergencyTicketId?: string;
  daysOverdrawn: number;
}

export function NegativeBalanceTable({
  overdrafts,
  isLoading,
  onRefresh,
}: {
  overdrafts: OverdraftHouseholdRow[];
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const [alertNotice, setAlertNotice] = React.useState<string | null>(null);

  const alertMutation = useMutation({
    mutationFn: async (householdId: string) => {
      return apiClient.post(`/api/admin/v1/billing/households/${householdId}/alert-overdraft`, {
        channel: 'SMS_PUSH',
      });
    },
    onSuccess: (data, hhId) => {
      setAlertNotice('Low balance & overdraft settlement alert dispatched to family.');
      onRefresh?.();
    },
    onError: (err: any) => {
      setAlertNotice(`Alert failed: ${err?.message}`);
    },
  });

  const columns: ColumnDef<OverdraftHouseholdRow>[] = [
    {
      header: 'Household & City',
      className: 'w-64',
      cell: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{row.householdName}</div>
          <div className="text-[11px] text-slate-500">
            {row.city} • {row.primaryContactPhone}
          </div>
        </div>
      ),
    },
    {
      header: 'Negative Balance (Debt)',
      className: 'w-48',
      cell: (row) => (
        <span className="text-xs font-bold text-rose-700 font-mono bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
          -₹{Math.abs(row.negativeBalancePaise / 100).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Last Emergency Event',
      className: 'w-48',
      cell: (row) => (
        <div className="text-xs text-slate-700 font-mono">
          {row.lastEmergencyTicketId ? (
            <span className="text-[11px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
              #{row.lastEmergencyTicketId.slice(0, 8)}
            </span>
          ) : (
            <span className="text-slate-400">Manual Overdraft</span>
          )}
        </div>
      ),
    },
    {
      header: 'Days Overdrawn',
      className: 'w-36',
      cell: (row) => (
        <Badge
          variant={row.daysOverdrawn > 7 ? 'destructive' : 'warning'}
          className="text-[11px] font-bold"
        >
          {row.daysOverdrawn} days
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'w-44 text-right',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2.5 text-rose-700 border-rose-300 hover:bg-rose-50"
          isLoading={
            alertMutation.isPending && alertMutation.variables === row.householdId
          }
          onClick={() => alertMutation.mutate(row.householdId)}
        >
          <Send className="w-3 h-3 mr-1" />
          Send Low Balance Alert
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {alertNotice && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
          <span>{alertNotice}</span>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {!isLoading && overdrafts.length === 0 ? (
        <EmptyState
          title="No Overdraft Accounts"
          description="All household wallets are currently solvent with positive or zero balances."
          actionLabel="Refresh Overdrafts"
          onAction={onRefresh}
        />
      ) : (
        <DataTable
          columns={columns}
          data={overdrafts}
          isLoading={isLoading}
          emptyMessage="No Overdraft Accounts: All household wallets are currently solvent with positive or zero balances."
        />
      )}
    </div>
  );
}
