'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  ColumnDef,
  Badge,
  Button,
  Input,
  Avatar,
  AvatarFallback,
  EmptyState,
  cn,
} from '@poco/ui';
import { Users, Search, Filter, RefreshCw, UserPlus, Eye, Network } from 'lucide-react';
import { UserRole } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import { useStaffUser } from '../providers';
import { SupervisorTree, SupervisorNode } from './components/supervisor-tree';
import { MediaViewerModal, MediaAsset } from './components/media-viewer-modal';
import {
  CareOfficerAssignmentModal,
  OfficerCandidate,
  HouseholdAssignmentTarget,
} from './components/assignment-modal';

export interface CareOfficerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  cluster: string;
  isAvailable: boolean;
  activeCaseload: number;
  assignedHousehold?: {
    id: string;
    name: string;
    address: string;
  } | null;
  supervisor?: {
    id: string;
    name: string;
    role: string;
  } | null;
  certifications: Array<{
    id: string;
    certificationCode: string;
    name?: string;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
    expiresAt: string;
    documentUrl?: string;
  }>;
}

export function CareOfficersRosterView() {
  const queryClient = useQueryClient();
  const { user } = useStaffUser();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [clusterFilter, setClusterFilter] = React.useState('ALL');
  const [showSupervisorTree, setShowSupervisorTree] = React.useState(false);

  const [selectedAsset, setSelectedAsset] = React.useState<MediaAsset | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = React.useState(false);

  const [assignmentHousehold, setAssignmentHousehold] =
    React.useState<HouseholdAssignmentTarget | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);

  const {
    data: officers = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<CareOfficerRow[]>({
    queryKey: ['admin-care-officers'],
    queryFn: async () => {
      return apiClient.get<CareOfficerRow[]>('/api/admin/v1/care-officers/supervised');
    },
    staleTime: 5000,
  });

  // Filtered officers list
  const filteredOfficers = React.useMemo(() => {
    return officers.filter((officer) => {
      const matchesSearch =
        officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.phone.includes(searchQuery) ||
        officer.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCluster =
        clusterFilter === 'ALL' || officer.cluster === clusterFilter;

      return matchesSearch && matchesCluster;
    });
  }, [officers, searchQuery, clusterFilter]);

  // Transform officers into supervisor nodes for tree view
  const supervisorTreeData = React.useMemo<SupervisorNode[]>(() => {
    const map = new Map<string, SupervisorNode>();

    officers.forEach((officer) => {
      const supId = officer.supervisor?.id || 'sup-unassigned';
      const supName = officer.supervisor?.name || 'Central Operations Pool';
      const supRole = officer.supervisor?.role || 'CARE_MANAGER';

      if (!map.has(supId)) {
        map.set(supId, {
          id: supId,
          name: supName,
          email: `${supId}@pocoeldercare.com`,
          role: supRole,
          cluster: officer.cluster,
          officers: [],
        });
      }

      map.get(supId)!.officers.push({
        id: officer.id,
        name: officer.name,
        phone: officer.phone,
        activeCaseload: officer.activeCaseload,
        assignedHouseholdName: officer.assignedHousehold?.name,
        isAvailable: officer.isAvailable,
      });
    });

    return Array.from(map.values());
  }, [officers]);

  // Candidates for assignment modal
  const officerCandidates: OfficerCandidate[] = officers.map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    isAvailable: o.isAvailable,
    cluster: o.cluster,
    certifications: o.certifications.map((c) => ({
      certificationCode: c.certificationCode,
      expiresAt: c.expiresAt,
      status: c.status,
    })),
  }));

  const columns: ColumnDef<CareOfficerRow>[] = [
    {
      header: 'Officer & Cluster',
      className: 'w-60',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-slate-800 text-white text-xs font-bold">
              {row.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xs font-bold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-slate-500">
              Cluster: <span className="font-semibold text-slate-700">{row.cluster}</span>
            </div>
            <div className="text-[10px] text-slate-400">{row.phone}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Household (1:1)',
      cell: (row) =>
        row.assignedHousehold ? (
          <div>
            <div className="text-xs font-bold text-slate-800">
              {row.assignedHousehold.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-xs">
              {row.assignedHousehold.address}
            </div>
          </div>
        ) : (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-semibold">
            Unassigned Household
          </span>
        ),
    },
    {
      header: 'Caseload',
      className: 'w-28 text-center',
      cell: (row) => (
        <Badge
          variant={row.activeCaseload > 3 ? 'warning' : 'secondary'}
          className="text-[11px] font-bold"
        >
          {row.activeCaseload} Active
        </Badge>
      ),
    },
    {
      header: 'Certifications',
      className: 'w-56',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.certifications.map((c) => {
            const isExpired = c.status === 'EXPIRED';
            const isExpiringSoon =
              c.status === 'ACTIVE' &&
              new Date(c.expiresAt).getTime() - Date.now() < 30 * 86400000;

            return (
              <Badge
                key={c.id || c.certificationCode}
                variant={isExpired ? 'destructive' : isExpiringSoon ? 'warning' : 'primary'}
                className="text-[10px] py-0 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (c.documentUrl) {
                    setSelectedAsset({
                      id: c.id,
                      title: `${row.name} — ${c.certificationCode} Certificate`,
                      type: 'PHOTO',
                      url: c.documentUrl,
                      officerName: row.name,
                    });
                    setIsMediaModalOpen(true);
                  }
                }}
              >
                {c.certificationCode}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      header: 'Supervisor',
      className: 'w-36',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.supervisor?.name || 'Central Lead'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'w-44 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2"
            onClick={() => {
              setAssignmentHousehold({
                id: row.assignedHousehold?.id || 'hh-new-assignment',
                name: row.assignedHousehold?.name || `${row.name} Assigned Area`,
                assignedCareOfficerId: row.id,
              });
              setIsAssignmentModalOpen(true);
            }}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Assign
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-1.5"
            onClick={() => {
              if (row.certifications[0]?.documentUrl) {
                setSelectedAsset({
                  id: row.certifications[0].id,
                  title: `${row.name} Training & KYC Assets`,
                  type: 'PHOTO',
                  url: row.certifications[0].documentUrl,
                  officerName: row.name,
                });
                setIsMediaModalOpen(true);
              }
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Care Officers Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage 1:1 dedicated household assignments, supervisor reporting trees, and compliance certifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSupervisorTree((s) => !s)}
            className="h-8 text-xs font-semibold"
          >
            <Network className="w-3.5 h-3.5 mr-1.5" />
            {showSupervisorTree ? 'Show Table Roster' : 'View Reporting Tree'}
          </Button>
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

      {/* Toolbar filters */}
      {!showSupervisorTree && (
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search officer by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            />
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-medium">Cluster:</span>
            <select
              aria-label="Cluster filter"
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            >
              <option value="ALL">All Clusters</option>
              <option value="BLR-NORTH">BLR-NORTH</option>
              <option value="BLR-SOUTH">BLR-SOUTH</option>
              <option value="BLR-EAST">BLR-EAST</option>
              <option value="PUN-WEST">PUN-WEST</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {showSupervisorTree ? (
        <SupervisorTree supervisors={supervisorTreeData} />
      ) : !isLoading && filteredOfficers.length === 0 ? (
        <EmptyState
          title="No Officers Found"
          description="No Care Officers match the active filter criteria. Adjust your search query or clear filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setClusterFilter('ALL');
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredOfficers}
          isLoading={isLoading}
          emptyMessage="No Officers Found: No Care Officers match the active filter criteria. Adjust your search query or clear filters."
        />
      )}

      {/* Assignment Modal */}
      <CareOfficerAssignmentModal
        open={isAssignmentModalOpen}
        onOpenChange={setIsAssignmentModalOpen}
        household={assignmentHousehold}
        officers={officerCandidates}
        callerRoles={user.roles}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-care-officers'] });
        }}
      />

      {/* Media Lightbox Viewer */}
      <MediaViewerModal
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        asset={selectedAsset}
      />
    </div>
  );
}

export default function CareOfficersPage() {
  return <CareOfficersRosterView />;
}
