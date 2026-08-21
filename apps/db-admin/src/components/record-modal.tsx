'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { TableDefinition } from '../lib/table-schemas';

interface RecordModalProps {
  isOpen: boolean;
  definition: TableDefinition;
  initialData?: Record<string, any> | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  definition,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      const defaultForm: Record<string, any> = {};
      definition.fields.forEach((field) => {
        if (field.isId) {
          defaultForm[field.name] = `${definition.name.toLowerCase().substring(0, 3)}-${Date.now()}`;
        } else if (field.type === 'boolean') {
          defaultForm[field.name] = true;
        } else if (field.type === 'number') {
          defaultForm[field.name] = 0;
        } else if (field.type === 'enum' && field.options) {
          defaultForm[field.name] = field.options[0];
        } else if (field.type === 'json') {
          defaultForm[field.name] = {};
        } else {
          defaultForm[field.name] = '';
        }
      });
      setFormData(defaultForm);
    }
    setJsonErrors({});
  }, [initialData, definition, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

  const handleInputChange = (fieldName: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleJsonChange = (fieldName: string, text: string) => {
    try {
      const parsed = JSON.parse(text);
      setFormData((prev) => ({ ...prev, [fieldName]: parsed }));
      setJsonErrors((prev) => ({ ...prev, [fieldName]: '' }));
    } catch (e: any) {
      setJsonErrors((prev) => ({ ...prev, [fieldName]: 'Invalid JSON format' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(jsonErrors).some(Boolean)) {
      alert('Please fix JSON syntax errors before saving.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-black text-slate-900 m-0">
              {isEditing ? `Edit ${definition.name} Record` : `Create New ${definition.name}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              {definition.displayName} • Table Schema Form
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definition.fields.map((field) => {
              const value = formData[field.name];

              return (
                <div key={field.name} className={field.type === 'json' ? 'md:col-span-2' : ''}>
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                    {field.label} {field.required && <span className="text-secondary-500">*</span>}
                  </label>

                  {field.type === 'boolean' ? (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange(field.name, true)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          value === true
                            ? 'bg-brand-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        TRUE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange(field.name, false)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          value === false
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        FALSE
                      </button>
                    </div>
                  ) : field.type === 'enum' && field.options ? (
                    <select
                      value={value || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-brand-500 bg-white"
                      required={field.required}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'json' ? (
                    <div>
                      <textarea
                        rows={4}
                        defaultValue={JSON.stringify(value, null, 2)}
                        onChange={(e) => handleJsonChange(field.name, e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-brand-500 bg-slate-50"
                        placeholder="{}"
                      />
                      {jsonErrors[field.name] && (
                        <span className="text-[10px] text-secondary-500 font-bold block mt-1">
                          ⚠️ {jsonErrors[field.name]}
                        </span>
                      )}
                    </div>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={value !== undefined ? value : ''}
                      onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-brand-500"
                      required={field.required}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value !== undefined && value !== null ? String(value) : ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={field.isId && isEditing}
                      className={`w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-brand-500 ${
                        field.isId ? 'bg-slate-50 font-mono font-bold' : ''
                      }`}
                      required={field.required}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black shadow-xs flex items-center gap-1.5 transition-all glow-primary"
            >
              <CheckCircle2 size={15} />
              <span>{isEditing ? 'Save Changes' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
