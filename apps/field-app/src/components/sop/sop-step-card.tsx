import React, { useState } from 'react';
import type { SopStepModel } from '../../db/models/sop-step';
import type { SopProgressModel } from '../../db/models/sop-progress';
import {
  CheckCircle2,
  Circle,
  FileText,
  Camera,
  Activity,
  Check,
  AlertCircle,
} from 'lucide-react';

export interface SopStepCardProps {
  step: SopStepModel;
  progress?: SopProgressModel | null;
  onSaveProgress: (data: {
    isCompleted: boolean;
    notes?: string;
    choiceValue?: string;
    proofUrl?: string;
  }) => Promise<void>;
  onTakePhoto?: () => void;
  photoPreviewUrl?: string;
}

export const SopStepCard: React.FC<SopStepCardProps> = ({
  step,
  progress,
  onSaveProgress,
  onTakePhoto,
  photoPreviewUrl,
}) => {
  const isMandatory = step.isMandatory ?? (step as any).is_mandatory ?? false;
  const inputType = step.inputType ?? (step as any).input_type ?? 'CHECKBOX';
  const stepIndex = step.stepIndex ?? (step as any).step_index ?? 1;
  const validationRules = step.validationRules ?? (step as any).validation_rules;

  const [isCompleted, setIsCompleted] = useState(progress?.isCompleted ?? (progress as any)?.is_completed ?? false);
  const [notes, setNotes] = useState(progress?.notes ?? '');
  const [choiceValue, setChoiceValue] = useState(progress?.choiceValue ?? (progress as any)?.choice_value ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveProgress({
        isCompleted,
        notes: notes || undefined,
        choiceValue: choiceValue || undefined,
        proofUrl: photoPreviewUrl || progress?.proofUrl,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      data-testid={`sop-step-card-${step.id}`}
      className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm transition-all ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Step Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            data-testid={`step-toggle-${step.id}`}
            onClick={handleToggleComplete}
            className="mt-0.5 text-emerald-600 focus:outline-none"
            aria-label={isCompleted ? 'Mark step incomplete' : 'Mark step complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step {stepIndex}
              </span>
              {isMandatory && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  Mandatory
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{step.title}</h3>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {inputType}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>

      {/* Dynamic Input Renderers */}
      <div className="space-y-3 pt-2">
        {/* Choice Selection */}
        {inputType === 'CHOICE' && validationRules?.allowedChoices && (
          <div className="space-y-2" data-testid={`choice-options-${step.id}`}>
            <label className="block text-xs font-semibold text-slate-700">Select Option:</label>
            <div className="grid grid-cols-1 gap-2">
              {validationRules.allowedChoices.map((choice: string) => (
                <button
                  key={choice}
                  type="button"
                  data-testid={`choice-option-${choice}`}
                  onClick={() => setChoiceValue(choice)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-colors ${
                    choiceValue === choice
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{choice}</span>
                  {choiceValue === choice && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo Proof Upload */}
        {inputType === 'PHOTO' && (
          <div className="space-y-2" data-testid={`photo-section-${step.id}`}>
            <label className="block text-xs font-semibold text-slate-700">Photo Proof:</label>
            {(photoPreviewUrl || progress?.proofUrl) ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 flex items-center gap-3">
                <img
                  src={photoPreviewUrl || progress?.proofUrl}
                  alt="Proof preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-emerald-700">Photo Attached</span>
                  <p className="text-[11px] text-slate-500">Ready for upload</p>
                </div>
                <button
                  type="button"
                  onClick={onTakePhoto}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 bg-white border border-slate-300 rounded-lg"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-testid={`take-photo-btn-${step.id}`}
                onClick={onTakePhoto}
                className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-700 transition-colors"
              >
                <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                <span className="text-xs font-semibold">Upload Proof Photo</span>
              </button>
            )}
          </div>
        )}

        {/* Clinical Notes / Observations */}
        <div>
          <label htmlFor={`notes-${step.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
            Caregiver Notes & Remarks:
          </label>
          <textarea
            id={`notes-${step.id}`}
            data-testid={`step-notes-input-${step.id}`}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log specific observations or measurements..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {savedSuccess ? 'Saved locally!' : isCompleted ? 'Completed' : 'Pending'}
        </span>

        <button
          type="button"
          data-testid={`save-step-btn-${step.id}`}
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Save Progress</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default SopStepCard;
