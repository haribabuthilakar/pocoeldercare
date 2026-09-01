'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataTable,
  ColumnDef,
  Badge,
  Button,
  EmptyState,
  cn,
} from '@poco/ui';
import { Layers, Plus, History, RefreshCw, Edit2, ShieldAlert } from 'lucide-react';
import { SopProofType } from '@poco/constants';
import { apiClient } from '@/lib/api-client';
import {
  CatalogEditorDrawer,
  CatalogServiceItem,
} from './components/catalog-editor-drawer';
import {
  HistoricalVersionSelector,
  ServiceVersionHistoryItem,
} from './components/historical-version-selector';

export interface ServiceCatalogRow extends CatalogServiceItem {
  versions: ServiceVersionHistoryItem[];
  activeSubscriberCount: number;
}

export function ServiceCatalogStudioView() {
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = React.useState<CatalogServiceItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [inspectingServiceId, setInspectingServiceId] = React.useState<string | null>(null);
  const [selectedHistoryVersionId, setSelectedHistoryVersionId] = React.useState<string>('');

  const {
    data: catalog = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<ServiceCatalogRow[]>({
    queryKey: ['admin-catalog-services'],
    queryFn: async () => {
      return apiClient.get<ServiceCatalogRow[]>('/api/common/catalog');
    },
    staleTime: 10000,
  });

  const inspectingService = catalog.find((c) => c.id === inspectingServiceId);

  const columns: ColumnDef<ServiceCatalogRow>[] = [
    {
      header: 'Service Name & Code',
      className: 'w-72',
      cell: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.code}</div>
        </div>
      ),
    },
    {
      header: 'Current Version',
      className: 'w-32',
      cell: (row) => (
        <Badge variant="primary" className="text-[11px] font-bold">
          v{row.currentVersion} (Active)
        </Badge>
      ),
    },
    {
      header: 'Price (₹ INR)',
      className: 'w-36',
      cell: (row) => (
        <span className="text-xs font-bold text-slate-900 font-mono">
          ₹{(row.currentPricePaise / 100).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Duration',
      className: 'w-28',
      cell: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.currentEstimatedDurationMinutes} mins
        </span>
      ),
    },
    {
      header: 'Required Certs',
      className: 'w-36',
      cell: (row) => (
        <Badge variant="secondary" className="text-[10px]">
          {row.currentRequiredCertifications.length} certifications
        </Badge>
      ),
    },
    {
      header: 'Grandfathered Users',
      className: 'w-40',
      cell: (row) => (
        <span className="text-xs font-semibold text-emerald-700">
          {row.activeSubscriberCount} active
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'w-48 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2"
            onClick={() => {
              setInspectingServiceId((prev) => (prev === row.id ? null : row.id));
              if (row.versions && row.versions.length > 0) {
                setSelectedHistoryVersionId(row.versions[0].id);
              }
            }}
          >
            <History className="w-3 h-3 mr-1 text-slate-500" />
            History
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="h-7 text-xs px-2.5 bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
            onClick={() => {
              setSelectedService(row);
              setIsEditorOpen(true);
            }}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Bump Version
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
            Service Catalog & Package Versioning Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create immutable versioned rate cards with integer paise precision and grandfathered contract protection.
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

      {/* Historical Version Inspector Panel */}
      {inspectingService && inspectingService.versions && (
        <HistoricalVersionSelector
          versions={inspectingService.versions}
          selectedVersionId={selectedHistoryVersionId || inspectingService.versions[0]?.id}
          onSelectVersion={setSelectedHistoryVersionId}
        />
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={catalog}
        isLoading={isLoading}
        emptyMessage="No catalog services configured."
      />

      {/* Catalog Version Bump Drawer */}
      <CatalogEditorDrawer
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        service={selectedService}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-catalog-services'] });
        }}
      />
    </div>
  );
}

export default function ServiceCatalogPage() {
  return <ServiceCatalogStudioView />;
}
