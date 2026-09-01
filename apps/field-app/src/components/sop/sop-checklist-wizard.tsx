import React, { useState, useEffect } from 'react';
import { database } from '../../db/database';
import type { SopStepModel } from '../../db/models/sop-step';
import type { SopProgressModel } from '../../db/models/sop-progress';
import { SopStepCard } from './sop-step-card';
import { ExceptionReportModal } from './exception-report-modal';
import { ActivateHouseholdModal } from './activate-household-modal';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Check,
} from 'lucide-react';

export interface SopChecklistWizardProps {
  serviceRequestId: string;
  sopVersionId?: string;
  isOnboardingVisit?: boolean;
  householdName?: string;
  onFinishVisit?: () => void;
  onHouseholdActivated?: () => void;
}

export const SopChecklistWizard: React.FC<SopChecklistWizardProps> = ({
  serviceRequestId,
  sopVersionId = 'sop_vitals_v1',
  isOnboardingVisit = false,
  householdName = 'Varma Household',
  onFinishVisit,
  onHouseholdActivated,
}) => {
  const [steps, setSteps] = useState<SopStepModel[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, SopProgressModel>>(new Map());
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [householdActive, setHouseholdActive] = useState(!isOnboardingVisit);

  const loadData = async () => {
    const allSteps = await database.sopSteps.query((s) => s.sop_version_id === sopVersionId);
    allSteps.sort((a, b) => a.stepIndex - b.stepIndex);

    const allProgress = await database.sopProgress.query(
      (p) => p.service_request_id === serviceRequestId,
    );
    const pMap = new Map<string, SopProgressModel>();
    allProgress.forEach((p) => pMap.set(p.sopStepId, p));

    setSteps(allSteps);
    setProgressMap(pMap);
  };

  useEffect(() => {
    loadData();
    const unsub = database.sopProgress.subscribe(loadData);
    return () => unsub();
  }, [serviceRequestId, sopVersionId]);

  const handleSaveStep = async (
    stepId: string,
    data: { isCompleted: boolean; notes?: string; choiceValue?: string; proofUrl?: string },
  ) => {
    const existing = progressMap.get(stepId);
    if (existing) {
      await database.sopProgress.update(existing.id, {
        is_completed: data.isCompleted,
        notes: data.notes,
        choice_value: data.choiceValue,
        proof_url: data.proofUrl,
        completed_at: data.isCompleted ? new Date().toISOString() : undefined,
        synced: false,
      });

      await database.stageMutation('SOP_PROGRESS', 'sop_progress', existing.id, {
        serviceRequestId,
        sopStepId: stepId,
        ...data,
      });
    } else {
      const newProgress = await database.sopProgress.create({
        service_request_id: serviceRequestId,
        sop_step_id: stepId,
        is_completed: data.isCompleted,
        notes: data.notes,
        choice_value: data.choiceValue,
        proof_url: data.proofUrl,
        completed_at: data.isCompleted ? new Date().toISOString() : undefined,
        synced: false,
      });

      await database.stageMutation('SOP_PROGRESS', 'sop_progress', newProgress.id, {
        serviceRequestId,
        sopStepId: stepId,
        ...data,
      });
    }

    await loadData();
  };

  const handleReportException = async (reason: string, notes?: string) => {
    await database.serviceRequests.update(serviceRequestId, {
      status: 'EXCEPTION_FLAGGED',
    });

    await database.stageMutation('STATUS_TRANSITION', 'service_requests', serviceRequestId, {
      type: 'FLAG_EXCEPTION',
      reason,
      notes,
      timestamp: new Date().toISOString(),
    });
  };

  const handleConfirmActivate = async () => {
    const household = (await database.households.query())[0];
    if (household) {
      await database.households.update(household.id, { status: 'ACTIVE' });
      await database.stageMutation('HOUSEHOLD_ACTIVATE', 'households', household.id, {
        status: 'ACTIVE',
        activatedAt: new Date().toISOString(),
      });
    }
    setHouseholdActive(true);
    onHouseholdActivated?.();
  };

  const completedCount = steps.filter((s) => progressMap.get(s.id)?.isCompleted).length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="space-y-5" data-testid="sop-wizard-container">
      {/* Sticky Progress & Actions Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
              data-testid="sop-progress-counter"
            >
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              SOP Checklist ({completedCount} of {totalCount} Completed)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Clinical Protocol Wizard</h3>
          </div>

          <button
            type="button"
            data-testid="report-exception-btn"
            onClick={() => setIsExceptionModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Exception
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            data-testid="sop-progress-bar"
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      {steps.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No SOP Steps Available for this Service Request.
        </div>
      ) : (
        <div className="space-y-4" data-testid="sop-steps-list">
          {steps.map((step) => {
            const prog = progressMap.get(step.id) || null;
            return (
              <SopStepCard
                key={step.id}
                step={step}
                progress={prog}
                onSaveProgress={(data) => handleSaveStep(step.id, data)}
              />
            );
          })}
        </div>
      )}

      {/* Completion Banner & Action CTAs */}
      {isAllComplete && (
        <div
          data-testid="sop-completion-banner"
          className="bg-emerald-500 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/20 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base">All SOP Steps Completed!</h4>
              <p className="text-xs text-emerald-100">
                You have fulfilled all mandatory clinical protocols for this visit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {isOnboardingVisit && !householdActive && (
              <button
                type="button"
                data-testid="activate-household-cta"
                onClick={() => setIsActivateModalOpen(true)}
                className="flex-1 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Activate Household
              </button>
            )}

            <button
              type="button"
              data-testid="wizard-finish-visit-btn"
              onClick={onFinishVisit}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Finish Home Visit
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExceptionReportModal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        onConfirm={handleReportException}
        householdName={householdName}
      />

      <ActivateHouseholdModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onConfirm={handleConfirmActivate}
        householdName={householdName}
      />
    </div>
  );
};
export default SopChecklistWizard;
