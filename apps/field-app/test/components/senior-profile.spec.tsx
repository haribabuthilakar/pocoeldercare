import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { database } from '../../src/db/database';
import { EmergencyProfileCard } from '../../src/components/seniors/emergency-profile-card';
import {
  VitalsEntryForm,
  evaluateVitalsRange,
} from '../../src/components/seniors/vitals-entry-form';
import { SeniorProfileScreen } from '../../src/app/seniors/[id]';
import { populateMockDatabase, mockSenior } from '../fixtures/database.fixture';
import { mockFieldSession } from '../fixtures/field-session.fixture';
import { SeniorModel } from '../../src/db/models/senior';

describe('Emergency Senior Profile & Vitals Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
    localStorage.setItem('poco_field_pin', '1234');
    localStorage.setItem('poco_field_locked', 'false');
    await database.clearAll();
    vi.clearAllMocks();
  });

  describe('EmergencyProfileCard Component', () => {
    it('renders red ICE banner, blood group, allergies, hospital, and 1-tap call button', () => {
      const seniorModel = new SeniorModel(mockSenior);
      const onCall = vi.fn();

      render(<EmergencyProfileCard senior={seniorModel} onCallContact={onCall} />);

      expect(screen.getByTestId('emergency-profile-card')).toBeInTheDocument();
      expect(screen.getByTestId('senior-name')).toHaveTextContent('Kalyan Varma');
      expect(screen.getByTestId('senior-blood-group')).toHaveTextContent('B+');
      expect(screen.getByTestId('allergy-chip-Penicillin')).toBeInTheDocument();
      expect(screen.getByTestId('allergy-chip-Sulfa drugs')).toBeInTheDocument();
      expect(screen.getByTestId('senior-hospital')).toHaveTextContent('Manipal Hospital');

      const dialBtn = screen.getByTestId('ice-dial-button');
      expect(dialBtn).toBeInTheDocument();

      fireEvent.click(dialBtn);
      expect(onCall).toHaveBeenCalledWith('+919845012345');
    });
  });

  describe('VitalsEntryForm & Range Validation', () => {
    it('evaluates physiological ranges accurately', () => {
      const normalRanges = evaluateVitalsRange({
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        bloodSugar: 110,
        spo2: 98,
        temperature: 98.6,
      });

      expect(normalRanges.bpStatus).toBe('normal');
      expect(normalRanges.pulseStatus).toBe('normal');
      expect(normalRanges.sugarStatus).toBe('normal');
      expect(normalRanges.spo2Status).toBe('normal');
      expect(normalRanges.tempStatus).toBe('normal');

      const abnormalRanges = evaluateVitalsRange({
        bpSystolic: 155,
        bpDiastolic: 95,
        pulse: 110,
        bloodSugar: 220,
        spo2: 88,
        temperature: 101.4,
      });

      expect(abnormalRanges.bpStatus).toBe('high');
      expect(abnormalRanges.pulseStatus).toBe('high');
      expect(abnormalRanges.sugarStatus).toBe('high');
      expect(abnormalRanges.spo2Status).toBe('critical');
      expect(abnormalRanges.tempStatus).toBe('high');
    });

    it('submits validated vitals through form inputs', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      render(<VitalsEntryForm onSaveVitals={onSave} />);

      fireEvent.change(screen.getByTestId('vitals-systolic-input'), {
        target: { value: '124' },
      });
      fireEvent.change(screen.getByTestId('vitals-diastolic-input'), {
        target: { value: '82' },
      });
      fireEvent.change(screen.getByTestId('vitals-pulse-input'), {
        target: { value: '76' },
      });
      fireEvent.change(screen.getByTestId('vitals-sugar-input'), {
        target: { value: '118' },
      });
      fireEvent.change(screen.getByTestId('vitals-spo2-input'), {
        target: { value: '99' },
      });
      fireEvent.change(screen.getByTestId('vitals-temp-input'), {
        target: { value: '98.4' },
      });
      fireEvent.change(screen.getByTestId('vitals-notes-input'), {
        target: { value: 'Vitals stable post-walk' },
      });

      fireEvent.click(screen.getByTestId('save-vitals-button'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          bpSystolic: 124,
          bpDiastolic: 82,
          pulse: 76,
          bloodSugar: 118,
          spo2: 99,
          temperature: 98.4,
          notes: 'Vitals stable post-walk',
        });
      });
    });
  });

  describe('SeniorProfileScreen Flow', () => {
    it('loads senior profile and stages outbox mutation on save vitals', async () => {
      await populateMockDatabase();

      render(<SeniorProfileScreen seniorId="snr_blr_001" />);

      await waitFor(() => {
        expect(screen.getByTestId('senior-profile-container')).toBeInTheDocument();
        expect(screen.getByText('Kalyan Varma')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('vitals-systolic-input'), {
        target: { value: '120' },
      });
      fireEvent.change(screen.getByTestId('vitals-diastolic-input'), {
        target: { value: '80' },
      });

      fireEvent.click(screen.getByTestId('save-vitals-button'));

      await waitFor(async () => {
        const outbox = await database.syncOutbox.query();
        const vitalsMutation = outbox.find((o) => o.mutationType === 'VITALS_RECORD');
        expect(vitalsMutation).toBeDefined();
        expect(vitalsMutation?.payload.bpSystolic).toBe(120);
      });
    });
  });
});
