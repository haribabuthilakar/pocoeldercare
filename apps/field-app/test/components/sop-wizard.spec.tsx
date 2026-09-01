import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { database } from '../../src/db/database';
import { SopStepCard } from '../../src/components/sop/sop-step-card';
import { SopChecklistWizard } from '../../src/components/sop/sop-checklist-wizard';
import { ExceptionReportModal } from '../../src/components/sop/exception-report-modal';
import { ActivateHouseholdModal } from '../../src/components/sop/activate-household-modal';
import {
  populateMockDatabase,
  mockSopSteps,
  mockHousehold,
} from '../fixtures/database.fixture';
import { mockFieldSession } from '../fixtures/field-session.fixture';

import { SopStepModel } from '../../src/db/models/sop-step';

describe('Guided Sequential SOP Wizard & Exception Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
    localStorage.setItem('poco_field_pin', '1234');
    localStorage.setItem('poco_field_locked', 'false');
    await database.clearAll();
    vi.clearAllMocks();
  });

  describe('SopStepCard Component', () => {
    it('renders step details, mandatory badge, and choice options', () => {
      const stepChoice = new SopStepModel(mockSopSteps[2]!); // Medication inventory choice step
      const onSave = vi.fn().mockResolvedValue(undefined);

      render(
        <SopStepCard
          step={stepChoice}
          onSaveProgress={onSave}
        />,
      );

      expect(screen.getByText('Medication Inventory Audit')).toBeInTheDocument();
      expect(screen.getByText('Mandatory')).toBeInTheDocument();
      expect(screen.getByTestId('choice-option-Full (7+ days)')).toBeInTheDocument();
      expect(screen.getByTestId('choice-option-Low (2-3 days)')).toBeInTheDocument();
    });

    it('toggles completion status and submits progress with choice and notes', async () => {
      const stepChoice = new SopStepModel(mockSopSteps[2]!);
      const onSave = vi.fn().mockResolvedValue(undefined);

      render(
        <SopStepCard
          step={stepChoice}
          onSaveProgress={onSave}
        />
      );

      // Select choice
      fireEvent.click(screen.getByTestId('choice-option-Low (2-3 days)'));

      // Enter notes
      const notesInput = screen.getByTestId('step-notes-input-sop_step_3');
      fireEvent.change(notesInput, { target: { value: 'Needs refill by Thursday' } });

      // Toggle complete
      const toggleBtn = screen.getByTestId('step-toggle-sop_step_3');
      fireEvent.click(toggleBtn);

      // Click save
      const saveBtn = screen.getByTestId('save-step-btn-sop_step_3');
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          isCompleted: true,
          notes: 'Needs refill by Thursday',
          choiceValue: 'Low (2-3 days)',
          proofUrl: undefined,
        });
      });
    });
  });

  describe('SopChecklistWizard Component', () => {
    beforeEach(async () => {
      await populateMockDatabase();
    });

    it('calculates progress counter and displays steps list', async () => {
      render(
        <SopChecklistWizard
          serviceRequestId="sr_field_001"
          sopVersionId="sop_vitals_v1"
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sop-progress-counter')).toHaveTextContent(
          'SOP Checklist (1 of 4 Completed)',
        );
        expect(screen.getByTestId('sop-steps-list')).toBeInTheDocument();
      });
    });

    it('renders completion banner and finish visit button when all steps are completed', async () => {
      // Mark all 4 steps as complete in DB
      for (const s of mockSopSteps) {
        await database.sopProgress.create({
          service_request_id: 'sr_field_001',
          sop_step_id: s.id,
          is_completed: true,
          synced: true,
        });
      }

      const onFinish = vi.fn();
      render(
        <SopChecklistWizard
          serviceRequestId="sr_field_001"
          sopVersionId="sop_vitals_v1"
          onFinishVisit={onFinish}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sop-completion-banner')).toBeInTheDocument();
        expect(screen.getByText('All SOP Steps Completed!')).toBeInTheDocument();
      });

      const finishBtn = screen.getByTestId('wizard-finish-visit-btn');
      fireEvent.click(finishBtn);
      expect(onFinish).toHaveBeenCalled();
    });

    it('renders Activate Household CTA during onboarding visits', async () => {
      for (const s of mockSopSteps) {
        await database.sopProgress.create({
          service_request_id: 'sr_field_001',
          sop_step_id: s.id,
          is_completed: true,
          synced: true,
        });
      }

      await database.households.update('hh_blr_001', { status: 'PENDING_ONBOARDING' });

      render(
        <SopChecklistWizard
          serviceRequestId="sr_field_001"
          sopVersionId="sop_vitals_v1"
          isOnboardingVisit={true}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('activate-household-cta')).toBeInTheDocument();
      });
    });
  });

  describe('ExceptionReportModal & Household Activation Dialogs', () => {
    it('handles exception reporting with blocker reason and transitions service request', async () => {
      await populateMockDatabase();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <ExceptionReportModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          householdName="Varma Household"
        />,
      );

      expect(screen.getByTestId('exception-report-dialog')).toBeInTheDocument();

      // Select access denied reason
      const accessDeniedRadio = screen.getByTestId('exception-reason-ACCESS_DENIED');
      fireEvent.click(accessDeniedRadio);

      // Enter notes
      const notesInput = screen.getByTestId('exception-notes-input');
      fireEvent.change(notesInput, { target: { value: 'Door locked, phone unanswered' } });

      const confirmBtn = screen.getByTestId('confirm-exception-button');
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(
          'ACCESS_DENIED',
          'Door locked, phone unanswered',
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('handles household activation confirmation', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <ActivateHouseholdModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          householdName="Varma Household"
        />,
      );

      expect(screen.getByTestId('activate-household-dialog')).toBeInTheDocument();

      const activateBtn = screen.getByTestId('confirm-activate-button');
      fireEvent.click(activateBtn);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
