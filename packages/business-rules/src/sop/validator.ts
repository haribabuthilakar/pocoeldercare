import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';

export interface SopStepDefinition {
  id: string;
  stepOrder: number;
  title: string;
  isRequired: boolean;
  proofType: 'NONE' | 'PHOTO' | 'CHOICE' | 'TEXT';
}

export interface SopStepExecution {
  sopStepVersionId: string;
  isCompleted: boolean;
  proofUrl?: string;
  choiceValue?: string;
  notes?: string;
}

export interface SopValidationResult {
  isComplete: boolean;
  totalSteps: number;
  completedRequiredSteps: number;
  missingStepTitles: string[];
}

/**
 * Pure function validating that all required SOP checklist steps are completed with required proofs per D-60.
 */
export function validateSopProgress(
  stepDefinitions: SopStepDefinition[],
  executions: SopStepExecution[]
): Result<SopValidationResult, DomainError> {
  const executionMap = new Map<string, SopStepExecution>(
    executions.map((e) => [e.sopStepVersionId, e])
  );

  const missingStepTitles: string[] = [];
  let completedRequired = 0;
  let totalRequired = 0;

  for (const step of stepDefinitions) {
    if (step.isRequired) {
      totalRequired++;
      const exec = executionMap.get(step.id);

      if (!exec || !exec.isCompleted) {
        missingStepTitles.push(step.title);
        continue;
      }

      // Check proof requirements
      if (step.proofType === 'PHOTO' && !exec.proofUrl) {
        missingStepTitles.push(`${step.title} (missing photo proof)`);
        continue;
      }
      if (step.proofType === 'CHOICE' && !exec.choiceValue) {
        missingStepTitles.push(`${step.title} (missing choice selection)`);
        continue;
      }

      completedRequired++;
    }
  }

  const isComplete = missingStepTitles.length === 0;

  if (!isComplete) {
    return err(
      new DomainError(
        DomainErrorCode.INCOMPLETE_SOP_STEPS,
        `Cannot complete service request: ${missingStepTitles.length} required SOP step(s) pending: ${missingStepTitles.join(', ')}`,
        { missingStepTitles }
      )
    );
  }

  return ok({
    isComplete: true,
    totalSteps: stepDefinitions.length,
    completedRequiredSteps: completedRequired,
    missingStepTitles: []
  });
}
