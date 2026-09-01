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
} from '@poco/ui';
import { Layers, Plus, Trash2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { SopProofType } from '@poco/constants';
import { createServiceCatalogVersionSchema } from '@poco/validation';
import { apiClient } from '@/lib/api-client';

export interface CatalogServiceItem {
  id: string;
  name: string;
  code: string;
  category: string;
  currentVersion: number;
  currentPricePaise: number;
  currentEstimatedDurationMinutes: number;
  currentRequiredCertifications: string[];
  currentSopSteps?: Array<{
    stepOrder: number;
    title: string;
    description?: string;
    isRequired: boolean;
    proofType: SopProofType;
  }>;
}

export interface CatalogEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: CatalogServiceItem | null;
  onSuccess?: () => void;
}

interface SopStepDraft {
  stepOrder: number;
  title: string;
  description: string;
  isRequired: boolean;
  proofType: SopProofType;
}

const AVAILABLE_CERT_CODES = [
  'BLS_CPR',
  'DEMENTIA_CORE',
  'PHYSIO_CERT',
  'GERIATRIC_NURSING',
  'MEDICATION_MGMT',
];

export function CatalogEditorDrawer({
  open,
  onOpenChange,
  service,
  onSuccess,
}: CatalogEditorDrawerProps) {
  const [priceRupees, setPriceRupees] = React.useState<string>('0');
  const [durationMinutes, setDurationMinutes] = React.useState<number>(60);
  const [selectedCerts, setSelectedCerts] = React.useState<string[]>([]);
  const [sopSteps, setSopSteps] = React.useState<SopStepDraft[]>([
    {
      stepOrder: 1,
      title: 'Arrive at household & verify senior identity',
      description: 'Check senior ID band or facial photo verification',
      isRequired: true,
      proofType: SopProofType.PHOTO,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (service) {
      setPriceRupees((service.currentPricePaise / 100).toFixed(2));
      setDurationMinutes(service.currentEstimatedDurationMinutes || 60);
      setSelectedCerts(service.currentRequiredCertifications || []);
      if (service.currentSopSteps && service.currentSopSteps.length > 0) {
        setSopSteps(
          service.currentSopSteps.map((s, idx) => ({
            stepOrder: idx + 1,
            title: s.title,
            description: s.description || '',
            isRequired: s.isRequired !== false,
            proofType: s.proofType || SopProofType.NONE,
          }))
        );
      } else {
        setSopSteps([
          {
            stepOrder: 1,
            title: 'Arrive at household & perform initial check',
            description: '',
            isRequired: true,
            proofType: SopProofType.NONE,
          },
        ]);
      }
      setError(null);
    }
  }, [service, open]);

  const handleToggleCert = (certCode: string) => {
    setSelectedCerts((prev) =>
      prev.includes(certCode) ? prev.filter((c) => c !== certCode) : [...prev, certCode]
    );
  };

  const handleAddSopStep = () => {
    setSopSteps((prev) => [
      ...prev,
      {
        stepOrder: prev.length + 1,
        title: '',
        description: '',
        isRequired: true,
        proofType: SopProofType.PHOTO,
      },
    ]);
  };

  const handleRemoveSopStep = (index: number) => {
    if (sopSteps.length <= 1) return;
    setSopSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, idx) => ({ ...step, stepOrder: idx + 1 }))
    );
  };

  const handleStepChange = (
    index: number,
    field: keyof SopStepDraft,
    value: any
  ) => {
    setSopSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    // Convert rupees to integer paise
    const parsedRupees = parseFloat(priceRupees);
    if (isNaN(parsedRupees) || parsedRupees < 0) {
      setError('Please enter a valid positive price.');
      return;
    }
    const pricePaise = Math.round(parsedRupees * 100);

    // Validate Zod schema
    const payload = {
      serviceCatalogId: service.id,
      pricePaise,
      estimatedDurationMinutes: Number(durationMinutes),
      requiredCertifications: selectedCerts,
      sopSteps: sopSteps.map((s, idx) => ({
        stepOrder: idx + 1,
        title: s.title.trim() || `Step ${idx + 1}`,
        description: s.description.trim() || undefined,
        isRequired: s.isRequired,
        proofType: s.proofType,
      })),
    };

    const validation = createServiceCatalogVersionSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Invalid catalog version payload.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(
        `/api/admin/v1/catalog/services/${service.id}/versions`,
        validation.data
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to publish new catalog version.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base text-slate-900">
            <Layers className="w-5 h-5 text-[#12C395]" />
            <span>Bump Service Version (v{service.currentVersion} → v{service.currentVersion + 1})</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {service.name} ({service.code}) — Creates an immutable rate card version while preserving grandfathered users.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Price in Rupees (converted to integer paise) */}
            <FormField label="Standard Rate Card (₹ INR)" required>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                  className="pl-7 text-xs font-bold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Stored internally as {Math.round(parseFloat(priceRupees || '0') * 100)} integer paise
              </span>
            </FormField>

            {/* Estimated Duration */}
            <FormField label="Estimated Duration (Minutes)" required>
              <Input
                type="number"
                min="5"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 60)}
                className="text-xs"
              />
            </FormField>
          </div>

          {/* Required Certifications Multi-select */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mandatory Officer Certifications
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CERT_CODES.map((code) => {
                const isSelected = selectedCerts.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleToggleCert(code)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-[#12C395]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SOP Steps Definition */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                SOP Field Execution Steps ({sopSteps.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={handleAddSopStep}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add SOP Step
              </Button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {sopSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Step {idx + 1}
                    </span>
                    {sopSteps.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove step ${idx + 1}`}
                        onClick={() => handleRemoveSopStep(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Input
                        placeholder="Step title (e.g. Check vital signs)..."
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <select
                        aria-label="Proof requirement"
                        value={step.proofType}
                        onChange={(e) =>
                          handleStepChange(idx, 'proofType', e.target.value as SopProofType)
                        }
                        className="w-full text-xs rounded-lg border border-slate-300 p-1.5 bg-white h-8 focus:outline-none focus:ring-2 focus:ring-[#12C395]"
                      >
                        <option value={SopProofType.NONE}>Proof: None</option>
                        <option value={SopProofType.PHOTO}>Proof: Photo</option>
                        <option value={SopProofType.CHOICE}>Proof: Choice</option>
                        <option value={SopProofType.TEXT}>Proof: Text Note</option>
                      </select>
                    </div>
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
              className="bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
            >
              Publish New Catalog Version
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
