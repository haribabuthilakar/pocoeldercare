'use client';

import * as React from 'react';
import {
  DataTable,
  ColumnDef,
  Badge,
  Button,
  EmptyState,
} from '@poco/ui';
import { ChevronLeft, ChevronRight, Database, Hash } from 'lucide-react';
import { JsonCellViewer, sanitizePii } from './json-cell-viewer';

export interface RawTableViewerProps {
  modelName: string;
  data: Record<string, any>[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export function RawTableViewer({
  modelName,
  data,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
}: RawTableViewerProps) {
  // Infer column keys from data rows
  const columns = React.useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (!data || data.length === 0) return [];

    // Collect distinct keys
    const keysSet = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((k) => keysSet.add(k));
    });

    const keys = Array.from(keysSet);

    // Prioritize id, createdAt
    const sortedKeys = keys.sort((a, b) => {
      if (a === 'id') return -1;
      if (b === 'id') return 1;
      if (a === 'createdAt') return 1;
      if (b === 'createdAt') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((key) => ({
      header: key,
      accessorKey: key,
      cell: (row: Record<string, any>) => {
        const val = row[key];

        if (val === null || val === undefined) {
          return <span className="text-slate-400 font-mono text-[10px]">null</span>;
        }

        // PII Sanitization for strings
        if (typeof val === 'string') {
          const sanitizedVal = sanitizePii(val);
          // Check if ISO date
          if (/^\d{4}-\d{2}-\d{2}T/.test(sanitizedVal)) {
            return (
              <span className="text-[11px] text-slate-600 font-mono">
                {new Date(sanitizedVal).toLocaleString()}
              </span>
            );
          }
          // UUID
          if (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              sanitizedVal
            )
          ) {
            return (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                {sanitizedVal.slice(0, 8)}...
              </span>
            );
          }
          return <span className="text-xs text-slate-800">{sanitizedVal}</span>;
        }

        if (typeof val === 'boolean') {
          return (
            <Badge variant={val ? 'primary' : 'secondary'} className="text-[10px]">
              {val ? 'TRUE' : 'FALSE'}
            </Badge>
          );
        }

        if (typeof val === 'number') {
          // Check if paise amount key
          if (key.toLowerCase().includes('paise')) {
            return (
              <span className="font-mono text-xs font-bold text-slate-900">
                ₹{(val / 100).toFixed(2)}
              </span>
            );
          }
          return <span className="font-mono text-xs text-slate-800">{val}</span>;
        }

        if (typeof val === 'object') {
          return <JsonCellViewer value={val} title={`${modelName}.${key}`} />;
        }

        return <span className="text-xs">{String(val)}</span>;
      },
    }));
  }, [data, modelName]);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage={`No records found in table "${modelName}".`}
      />

      {/* Pagination Footer */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center space-x-1.5">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Total Records: <strong className="text-slate-900">{totalRecords}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span>
            Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
