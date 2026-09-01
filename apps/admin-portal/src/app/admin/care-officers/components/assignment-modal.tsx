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
  Badge,
  FormField,
  Input,
  cn,
} from '@poco/ui';
import { ShieldAlert, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { UserRole } from '@poco/constants';
import { validateCareOfficerAssignment } from '@poco/business-rules';
import { apiClient } from '@/lib/api-client';

export interface OfficerCandidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isAvailable: boolean;
  cluster: string;
  certifications: Array<{
    certificationCode: string;
    expiresAt: Date | string;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  }>;
}

export interface HouseholdAssignmentTarget {
  id: string;
  name: string;
  city?: string;
  assignedCareOfficerId?: string | null;
}

export interface CareOfficerAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  household: HouseholdAssignmentTarget | null;
  officers: OfficerCandidate[];
  callerRoles: UserRole[];
  requiredCerts?: string[];
  onSuccess?: () => void;
}

export function CareOfficerAssignmentModal({
  open,
  onOpenChange,
  household,
  officers,
  callerRoles,
  requiredCerts = ['BLS_CPR', 'DEMENTIA_CORE'],
  onSuccess,
}: CareOfficerAssignmentModalProps) {
  const [selectedOfficerId, setSelectedOfficerId] = React.useState<string>('');
  const [isManagerOverride, setIsManagerOverride] = React.useState(false);
  const [overrideReason, setOverrideReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Initialize selected officer when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedOfficerId(officers[0]?.id || '');
      setIsManagerOverride(false);
      setOverrideReason('');
      setSubmitError(null);
    }
  }, [open, officers]);

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId);

  // Format officer certs with Date instances for pure validator
  const normalizedCandidate = React.useMemo(() => {
    if (!selectedOfficer) return null;
    return {
      id: selectedOfficer.id,
      isAvailable: selectedOfficer.isAvailable,
      certifications: selectedOfficer.certifications.map((c) => ({
        certificationCode: c.certificationCode,
        expiresAt: new Date(c.expiresAt),
        status: c.status,
      })),
    };
  }, [selectedOfficer]);

  // Run pure domain validation
  const validationResult = React.useMemo(() => {
    if (!normalizedCandidate || !household) return null;
    return validateCareOfficerAssignment(
      callerRoles,
      household,
      normalizedCandidate,
      requiredCerts
    );
  }, [normalizedCandidate, household, callerRoles, requiredCerts]);

  const isEligible = validationResult?.ok === true;
  const isCareManager =
    callerRoles.includes(UserRole.CARE_MANAGER) ||
    callerRoles.includes(UserRole.SUPER_ADMIN);

  const canSubmit =
    Boolean(selectedOfficerId) &&
    (isEligible || (isCareManager && isManagerOverride && overrideReason.trim().length >= 5));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !selectedOfficerId || !canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.post('/api/admin/v1/care-officers/assign', {
        householdId: household.id,
        careOfficerId: selectedOfficerId,
        managerOverride: isManagerOverride,
        overrideReason: isManagerOverride ? overrideReason.trim() : undefined,
        requiredCerts,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to assign Care Officer to household.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!household) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base text-slate-900">
            <UserCheck className="w-5 h-5 text-[#12C395]" />
            <span>Assign Dedicated Care Officer</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Household: {household.name} ({household.city || 'Bengaluru'}) — Strict 1:1 Care Officer Mapping
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Care Officer Candidate Selector */}
          <FormField label="Select Field Care Officer" required>
            <select
              aria-label="Select Field Care Officer"
              value={selectedOfficerId}
              onChange={(e) => {
                setSelectedOfficerId(e.target.value);
                setIsManagerOverride(false);
                setOverrideReason('');
              }}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            >
              {officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.name} (Cluster: {officer.cluster}) — {officer.isAvailable ? 'Available' : 'Unavailable'}
                </option>
              ))}
            </select>
          </FormField>

          {/* Certification Gating Result Banner */}
          {selectedOfficer && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Compliance & Certification Verification
              </div>

              {isEligible ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#12C395] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Officer Fully Certified & Eligible</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      All required certifications ({requiredCerts.join(', ')}) are verified active and unexpired.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Officer Ineligible: Compliance Failure</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      {validationResult && !validationResult.ok
                        ? validationResult.error.message
                        : 'Missing or expired mandatory certifications.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manager Override Section for CARE_MANAGER / SUPER_ADMIN */}
          {!isEligible && isCareManager && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manager-override-checkbox"
                  checked={isManagerOverride}
                  onChange={(e) => setIsManagerOverride(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <label
                  htmlFor="manager-override-checkbox"
                  className="text-xs font-bold text-amber-950 cursor-pointer"
                >
                  Manager Override (Exceptional Temporary Assignment)
                </label>
              </div>

              {isManagerOverride && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] text-amber-800 font-medium">
                    You are overriding certification compliance gating. An immutable security audit log entry will be created.
                  </div>
                  <FormField label="Mandatory Override Audit Reason" required>
                    <textarea
                      required
                      rows={2}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Specify emergency reason or scheduled recertification date..."
                      className="w-full text-xs rounded-xl border border-amber-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </FormField>
                </div>
              )}
            </div>
          )}

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
              disabled={!canSubmit}
              isLoading={isSubmitting}
              className="bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
            >
              Assign Care Officer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
