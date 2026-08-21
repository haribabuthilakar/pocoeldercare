'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Code, Download, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { TableDefinition } from '../lib/table-schemas';

interface CrudTableProps {
  definition: TableDefinition;
  rows: Record<string, any>[];
  onCreateClick: () => void;
  onEditClick: (row: Record<string, any>) => void;
  onDeleteClick: (row: Record<string, any>) => void;
  onJsonClick: (row: Record<string, any>) => void;
}

export const CrudTable: React.FC<CrudTableProps> = ({
  definition,
  rows,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onJsonClick,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>(definition.primaryKey);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Filter rows
  const filteredRows = rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
      return String(val).toLowerCase().includes(q);
    });
  });

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(fieldName);
      setSortAsc(true);
    }
  };

  const handleExportCsv = () => {
    if (rows.length === 0) return;
    const headers = definition.fields.map((f) => f.name).join(',');
    const csvContent = rows
      .map((row) =>
        definition.fields
          .map((f) => {
            const val = row[f.name];
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${definition.name}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bento-card p-6 space-y-4">
      {/* Table Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${definition.displayName}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder-slate-400 focus:outline-brand-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onCreateClick}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all glow-primary"
          >
            <Plus size={15} />
            <span>Add {definition.name}</span>
          </button>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              {definition.fields.map((field) => (
                <th
                  key={field.name}
                  onClick={() => handleSort(field.name)}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{field.label}</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={definition.fields.length + 1} className="py-8 text-center text-slate-400 font-medium">
                  No records found in table "{definition.name}".
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr key={row[definition.primaryKey] || idx} className="hover:bg-slate-50/80 transition-colors">
                  {definition.fields.map((field) => {
                    const value = row[field.name];

                    return (
                      <td key={field.name} className="py-3 px-4 max-w-[220px] truncate">
                        {field.type === 'boolean' ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              value
                                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {value ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : field.type === 'enum' ? (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">
                            {value || '—'}
                          </span>
                        ) : field.type === 'json' ? (
                          <span className="font-mono text-[11px] text-slate-600 truncate block">
                            {JSON.stringify(value)}
                          </span>
                        ) : field.isId ? (
                          <span className="font-mono text-slate-900 font-bold text-[11px]">
                            {value}
                          </span>
                        ) : (
                          <span className="text-slate-800">
                            {value !== undefined && value !== null ? String(value) : '—'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {/* Row Actions */}
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onJsonClick(row)}
                      title="Inspect JSON"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <Code size={13} />
                    </button>
                    <button
                      onClick={() => onEditClick(row)}
                      title="Edit Row"
                      className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(row)}
                      title="Delete Row"
                      className="p-1.5 rounded-lg hover:bg-secondary-50 text-secondary-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
        <span>
          Showing <strong>{sortedRows.length === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{' '}
          <strong>{Math.min(page * pageSize, sortedRows.length)}</strong> of <strong>{sortedRows.length}</strong> rows
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="font-bold text-slate-800">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
