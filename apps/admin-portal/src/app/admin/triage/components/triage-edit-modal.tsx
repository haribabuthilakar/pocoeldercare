'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  FormField,
  Input,
  Badge,
  cn,
} from '@poco/ui';
import { Sparkles, Plus, Trash2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface ServiceCatalogOption {
  id: string;
  name: string;
  code: string;
  category?: string;
  currentVersionId: string;
}

export interface TriageEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: {
    id: string;
    title: string;
    description?: string;
    isEmergency?: boolean;
    suggestedServiceVersionId?: string;
    suggestedServiceName?: string;
    household?: { name: string };
  } | null;
  catalogOptions?: ServiceCatalogOption[];
  onSuccess?: () => void;
}

interface ServiceRequestDraft {
  serviceCatalogVersionId: string;
  notes: string;
}

const fallbackCatalogOptions: ServiceCatalogOption[] = [
  {
    id: 'cat-01',
    name: 'General Elder Care Visit',
    code: 'GENERAL_CARE_VISIT',
    currentVersionId: 'sv-version-general-01',
  },
  {
    id: 'cat-02',
    name: 'In-Home Physiotherapy Session',
    code: 'PHYSIO_SESSION',
    currentVersionId: 'sv-version-physio-01',
  },
  {
    id: 'cat-03',
    name: 'Pharmacy Prescription Delivery',
    code: 'PHARMA_DELIVERY',
    currentVersionId: 'sv-version-pharma-01',
  },
  {
    id: 'cat-04',
    name: 'Emergency Medical SOS Response',
    code: 'EMERGENCY_SOS',
    currentVersionId: 'sv-version-emergency-01',
  },
  {
    id: 'cat-05',
    name: 'Home Modification Assessment',
    code: 'HOME_MODIFICATION',
    currentVersionId: 'sv-version-home-01',
  },
];

export function TriageEditModal({
  open,
  onOpenChange,
  ticket,
  catalogOptions = fallbackCatalogOptions,
  onSuccess,
}: TriageEditModalProps) {
  const [items, setItems] = React.useState<ServiceRequestDraft[]>([
    {
      serviceCatalogVersionId:
        ticket?.suggestedServiceVersionId || fallbackCatalogOptions[0]?.currentVersionId || 'sv-version-general-01',
      notes: '',
    },
  ]);
  const [isEmergency, setIsEmergency] = React.useState<boolean>(ticket?.isEmergency || false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync state when ticket changes
  React.useEffect(() => {
    if (ticket) {
      setItems([
        {
          serviceCatalogVersionId:
            ticket.suggestedServiceVersionId ||
            catalogOptions[0]?.currentVersionId ||
            'sv-version-general-01',
          notes: '',
        },
      ]);
      setIsEmergency(!!ticket.isEmergency);
      setError(null);
    }
  }, [ticket, catalogOptions]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        serviceCatalogVersionId:
          catalogOptions[0]?.currentVersionId || 'sv-version-general-01',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ServiceRequestDraft,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    // Validate at least 1 item with version
    if (items.some((it) => !it.serviceCatalogVersionId)) {
      setError('Please select a valid service catalog item for each request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(`/api/admin/v1/tickets/${ticket.id}/triage`, {
        items: items.map((it) => ({
          serviceCatalogVersionId: it.serviceCatalogVersionId,
          notes: it.notes.trim() || undefined,
        })),
        isEmergency,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit ticket triage decomposition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base">
            <Sparkles className="w-4 h-4 text-[#12C395]" />
            <span>Customize Triage Decomposition</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ticket #{ticket.id.slice(0, 8)}: {ticket.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Silent Emergency Flag Checkbox */}
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="emergency-checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="emergency-checkbox" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Mark as High-Priority Emergency / SOS Event
            </label>
          </div>

          {/* Multi-Item Decomposed Service Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Child Service Requests ({items.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={handleAddItem}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Service Item
              </Button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Service Request #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove item ${idx + 1}`}
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <select
                      value={item.serviceCatalogVersionId}
                      onChange={(e) =>
                        handleItemChange(idx, 'serviceCatalogVersionId', e.target.value)
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395]"
                    >
                      {catalogOptions.map((opt) => (
                        <option key={opt.currentVersionId} value={opt.currentVersionId}>
                          {opt.name} ({opt.code})
                        </option>
                      ))}
                    </select>

                    <Input
                      placeholder="Special instructions or field officer notes..."
                      value={item.notes}
                      onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Confirm Triage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
