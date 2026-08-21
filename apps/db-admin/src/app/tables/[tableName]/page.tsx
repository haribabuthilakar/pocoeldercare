'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Table, ArrowLeft } from 'lucide-react';
import { TABLE_DEFINITIONS, TableDefinition } from '../../../lib/table-schemas';
import { dbStore } from '../../../lib/mock-db-store';
import { CrudTable } from '../../../components/crud-table';
import { RecordModal } from '../../../components/record-modal';
import { DeleteConfirmModal } from '../../../components/delete-confirm-modal';
import { JsonRawDrawer } from '../../../components/json-raw-drawer';

export default function TableCrudPage() {
  const params = useParams();
  const router = useRouter();
  const tableName = params.tableName as string;
  const definition: TableDefinition = TABLE_DEFINITIONS[tableName];

  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, any> | null>(null);
  const [deleteRow, setDeleteRow] = useState<Record<string, any> | null>(null);
  const [jsonRow, setJsonRow] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!definition) return;
    setRows(dbStore.getTableRows(tableName));
    return dbStore.subscribe(() => {
      setRows(dbStore.getTableRows(tableName));
    });
  }, [tableName, definition]);

  if (!definition) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-black text-slate-900">Table "{tableName}" not found.</h2>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  const handleSaveRecord = (data: Record<string, any>) => {
    if (editRow) {
      dbStore.updateRow(tableName, editRow[definition.primaryKey], data);
      setEditRow(null);
    } else {
      dbStore.createRow(tableName, data);
      setIsCreateModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteRow) {
      dbStore.deleteRow(tableName, deleteRow[definition.primaryKey]);
      setDeleteRow(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
                {definition.name}
              </h1>
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                {definition.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
              {definition.displayName} • {rows.length} total rows
            </p>
          </div>
        </div>
      </div>

      {/* Main CRUD Table Component */}
      <CrudTable
        definition={definition}
        rows={rows}
        onCreateClick={() => setIsCreateModalOpen(true)}
        onEditClick={(row) => setEditRow(row)}
        onDeleteClick={(row) => setDeleteRow(row)}
        onJsonClick={(row) => setJsonRow(row)}
      />

      {/* Create / Edit Modal */}
      <RecordModal
        isOpen={isCreateModalOpen || !!editRow}
        definition={definition}
        initialData={editRow}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditRow(null);
        }}
        onSave={handleSaveRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteRow}
        definition={definition}
        row={deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* JSON Raw Drawer */}
      <JsonRawDrawer
        isOpen={!!jsonRow}
        definition={definition}
        row={jsonRow}
        onClose={() => setJsonRow(null)}
      />
    </div>
  );
}
