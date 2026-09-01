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
import { UserPlus, Search, Send, RefreshCw, CheckCircle2, PhoneCall } from 'lucide-react';
import { LeadStage } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import { LeadStageDropdown } from './components/lead-stage-dropdown';

export interface LeadRow {
  id: string;
  contactName: string;
  phone: string;
  email?: string | null;
  city?: string;
  stage: LeadStage;
  notes?: string;
  assignedSalesExecutive?: string;
  assignedCsExecutive?: string;
  createdAt: string;
  convertedHouseholdId?: string | null;
}

function LeadPipelineView() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stageFilter, setStageFilter] = React.useState<string>('ALL');
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const {
    data: leads = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<LeadRow[]>({
    queryKey: ['admin-leads-pipeline'],
    queryFn: async () => {
      return apiClient.get<LeadRow[]>('/api/admin/v1/leads');
    },
    staleTime: 5000,
  });

  const reminderMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return apiClient.post(`/api/admin/v1/leads/${leadId}/remind`, {
        channel: 'SMS_WHATSAPP',
      });
    },
    onSuccess: (data, leadId) => {
      setActionNotice(`Payment & onboarding reminder sent successfully to lead.`);
    },
    onError: (err: any) => {
      setActionNotice(`Failed to dispatch reminder: ${err?.message}`);
    },
  });

  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = stageFilter === 'ALL' || lead.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [leads, searchQuery, stageFilter]);

  const columns: ColumnDef<LeadRow>[] = [
    {
      header: 'Contact Name & Phone',
      className: 'w-64',
      cell: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{row.contactName}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.phone}</div>
          {row.email && <div className="text-[10px] text-slate-400 truncate">{row.email}</div>}
        </div>
      ),
    },
    {
      header: 'City / Region',
      className: 'w-32',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.city || 'Bengaluru'}
        </span>
      ),
    },
    {
      header: 'Pipeline Stage',
      className: 'w-48',
      cell: (row) => (
        <LeadStageDropdown
          leadId={row.id}
          currentStage={row.stage}
          onStageChange={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads-pipeline'] });
          }}
        />
      ),
    },
    {
      header: 'Team Ownership',
      className: 'w-44',
      cell: (row) => {
        const isConverted = row.stage === LeadStage.CONVERTED;
        return (
          <div className="text-[11px]">
            <div className="text-slate-500 font-medium">
              {isConverted ? 'Customer Success:' : 'Sales Executive:'}
            </div>
            <div className="font-semibold text-slate-800">
              {isConverted
                ? row.assignedCsExecutive || 'CS Onboarding Team'
                : row.assignedSalesExecutive || 'Direct Web Lead'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Created Date',
      className: 'w-32',
      cell: (row) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'w-48 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-2">
          {row.stage !== LeadStage.CONVERTED && row.stage !== LeadStage.LOST && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
              isLoading={
                reminderMutation.isPending && reminderMutation.variables === row.id
              }
              onClick={() => reminderMutation.mutate(row.id)}
            >
              <Send className="w-3 h-3 mr-1 text-slate-500" />
              Send Reminder
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lead Management Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track prospective customer signups, stage progressions, and Sales-to-Customer Success ownership transitions.
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

      {actionNotice && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar filters */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by contact name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#12C395]"
          />
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-medium">Stage:</span>
          <select
            aria-label="Lead stage filter"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395]"
          >
            <option value="ALL">All Stages</option>
            <option value={LeadStage.NEW}>New Leads</option>
            <option value={LeadStage.CONTACTED}>Contacted</option>
            <option value={LeadStage.VISIT_SCHEDULED}>Visit Scheduled</option>
            <option value={LeadStage.CONVERTED}>Converted</option>
            <option value={LeadStage.LOST}>Lost</option>
          </select>
        </div>
      </div>

      {!isLoading && filteredLeads.length === 0 ? (
        <EmptyState
          title="No Active Leads"
          description="No new leads awaiting outreach or onboarding. New signups will automatically appear here."
          actionLabel="Refresh Leads"
          onAction={() => refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          isLoading={isLoading}
          emptyMessage="No Active Leads: No new leads awaiting outreach or onboarding. New signups will automatically appear here."
        />
      )}
    </div>
  );
}

export default function LeadsPage() {
  return <LeadPipelineView />;
}
