import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { database } from '../../src/db/database';
import {
  GeofenceStatus,
  calculateDistanceMeters,
} from '../../src/components/visits/geofence-status';
import { VisitCard } from '../../src/components/visits/visit-card';
import { FinishVisitModal } from '../../src/components/visits/finish-visit-modal';
import { VisitsScreen } from '../../src/app/visits/index';
import {
  populateMockDatabase,
  mockHousehold,
  mockSenior,
  mockServiceRequest,
} from '../fixtures/database.fixture';
import { mockFieldSession } from '../fixtures/field-session.fixture';

describe('Visit Lifecycle & Geofence Verification Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
    localStorage.setItem('poco_field_pin', '1234');
    localStorage.setItem('poco_field_locked', 'false');
    await database.clearAll();
    vi.clearAllMocks();
  });

  describe('GPS Haversine Distance & GeofenceStatus Component', () => {
    it('calculates accurate distance between coordinates', () => {
      const pointA = { latitude: 12.9716, longitude: 77.6412 }; // Indiranagar
      const pointB = { latitude: 12.9719, longitude: 77.6415 }; // ~45 meters away

      const distance = calculateDistanceMeters(pointA, pointB);
      expect(distance).toBeGreaterThan(30);
      expect(distance).toBeLessThan(60);
    });

    it('renders "GPS Verified" when within 200m geofence radius', () => {
      render(
        <GeofenceStatus
          deviceCoords={{ latitude: 12.9716, longitude: 77.6412 }}
          targetCoords={{ latitude: 12.9716, longitude: 77.6412 }}
          thresholdMeters={200}
        />,
      );

      expect(screen.getByTestId('geofence-status-banner')).toBeInTheDocument();
      expect(screen.getByTestId('geofence-text')).toHaveTextContent('GPS Verified (0m from household)');
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('renders "Outside Target Radius" with audit message when beyond 200m without blocking', () => {
      render(
        <GeofenceStatus
          deviceCoords={{ latitude: 12.9716, longitude: 77.6412 }}
          targetCoords={{ latitude: 12.9352, longitude: 77.6245 }} // Koramangala (~4.5km away)
          thresholdMeters={200}
        />,
      );

      expect(screen.getByTestId('geofence-status-banner')).toBeInTheDocument();
      expect(screen.getByTestId('geofence-text')).toHaveTextContent('Outside Target Radius');
      expect(screen.getByText('Logged')).toBeInTheDocument();
    });
  });

  describe('VisitCard Component', () => {
    it('renders scheduled visit with senior avatar, address, and Start Visit CTA', async () => {
      await populateMockDatabase();
      const sr = (await database.serviceRequests.find('sr_field_001'))!;
      const household = await database.households.find('hh_blr_001');
      const senior = await database.seniors.find('snr_blr_001');

      const onStart = vi.fn();
      render(
        <VisitCard
          serviceRequest={sr}
          household={household}
          senior={senior}
          onStartVisit={onStart}
        />,
      );

      expect(screen.getByText('Kalyan Varma')).toBeInTheDocument();
      expect(screen.getByText('Varma Household')).toBeInTheDocument();
      expect(screen.getByText('Monthly Vitals & Physical Assessment')).toBeInTheDocument();

      const startBtn = screen.getByTestId('start-visit-btn-sr_field_001');
      expect(startBtn).toHaveTextContent('Start Visit');

      fireEvent.click(startBtn);
      expect(onStart).toHaveBeenCalledWith('sr_field_001');
    });

    it('renders In Progress badge and Resume/Finish buttons when visit is active', async () => {
      await populateMockDatabase();
      await database.serviceRequests.update('sr_field_001', { status: 'IN_PROGRESS' });
      const sr = (await database.serviceRequests.find('sr_field_001'))!;
      const household = await database.households.find('hh_blr_001');
      const senior = await database.seniors.find('snr_blr_001');

      const onFinish = vi.fn();
      render(
        <VisitCard
          serviceRequest={sr}
          household={household}
          senior={senior}
          onFinishVisit={onFinish}
        />,
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByTestId('resume-visit-btn-sr_field_001')).toBeInTheDocument();

      const finishBtn = screen.getByTestId('finish-visit-btn-sr_field_001');
      fireEvent.click(finishBtn);
      expect(onFinish).toHaveBeenCalledWith('sr_field_001');
    });
  });

  describe('FinishVisitModal Component', () => {
    it('renders step completion summary and submits notes upon confirmation', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <FinishVisitModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          completedStepsCount={4}
          totalStepsCount={4}
          householdName="Varma Household"
        />,
      );

      expect(screen.getByTestId('finish-visit-dialog')).toBeInTheDocument();
      expect(screen.getByText('4 of 4 SOP Steps Completed')).toBeInTheDocument();

      const notesInput = screen.getByTestId('finish-visit-notes-input');
      fireEvent.change(notesInput, { target: { value: 'Senior is doing well.' } });

      const confirmBtn = screen.getByTestId('confirm-finish-button');
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith('Senior is doing well.');
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('VisitsScreen Schedule View', () => {
    it('renders empty state when there are no scheduled visits', async () => {
      render(<VisitsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-visits-state')).toBeInTheDocument();
        expect(screen.getByText('No Scheduled Visits')).toBeInTheDocument();
      });
    });

    it('loads and displays assigned visits list', async () => {
      await populateMockDatabase();
      render(<VisitsScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('visits-list')).toBeInTheDocument();
        expect(screen.getByText('Kalyan Varma')).toBeInTheDocument();
      });
    });

    it('handles Start Visit action, updates local status to ON_SITE and stages outbox mutation', async () => {
      await populateMockDatabase();
      const onNavigate = vi.fn();

      render(<VisitsScreen onNavigateToDetail={onNavigate} />);

      await waitFor(() => {
        expect(screen.getByTestId('start-visit-btn-sr_field_001')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('start-visit-btn-sr_field_001'));

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith('sr_field_001');
      });

      const updatedSR = await database.serviceRequests.find('sr_field_001');
      expect(updatedSR?.status).toBe('ON_SITE');

      const outbox = await database.syncOutbox.query();
      expect(outbox.length).toBeGreaterThan(0);
      expect(outbox[0]?.mutationType).toBe('STATUS_TRANSITION');
    });
  });
});
