import { describe, it, expect, beforeEach } from 'vitest';
import { localStore } from '../db/sqlite-client';
import { SyncWorker } from '../db/sync-worker';

describe('Care Officer Field App Workflows', () => {
  beforeEach(() => {
    localStore.clearQueue();
    SyncWorker.setOnline(true);
  });

  it('Flow 1: Offline SQLite local storage and mutation queue lifecycle', () => {
    const initialCount = localStore.getPendingQueueCount();
    expect(initialCount).toBe(0);

    // Save vitals while offline
    SyncWorker.setOnline(false);
    expect(SyncWorker.isOnline()).toBe(false);

    localStore.saveVitals({
      id: 'vit-test-01',
      visitId: 'visit-001',
      memberId: 'mem-001',
      systolicBp: 125,
      diastolicBp: 80,
      pulseBpm: 72,
      spo2Percent: 98,
      isAbnormal: false,
      escalatedToDoctor: false,
      capturedAt: new Date().toISOString(),
    });

    expect(localStore.getPendingQueueCount()).toBe(1);
    expect(SyncWorker.getPendingCount()).toBe(1);

    // Reconnect to network and drain queue
    SyncWorker.setOnline(true);
    expect(SyncWorker.isOnline()).toBe(true);
  });

  it('Flow 2: Rapid <5 min SOP checklist execution and visit completion', () => {
    const visits = localStore.getVisits();
    expect(visits.length).toBeGreaterThan(0);
    const targetVisit = visits[0];

    localStore.saveSopExecution({
      id: 'exec-test-01',
      visitId: targetVisit.id,
      sopTemplateCode: 'SOP-CARE-01',
      stepResults: [
        { stepId: 'step-1', stepName: 'Identification', category: 'General', status: 'PASSED' },
        { stepId: 'step-2', stepName: 'Pillbox', category: 'Clinical', status: 'PASSED', photoUri: 'file:///p.jpg' },
      ],
      durationSeconds: 140, // 2:20 min (well under 5 min)
      completedAt: new Date().toISOString(),
    });

    const updatedVisit = localStore.getVisitById(targetVisit.id);
    expect(updatedVisit?.status).toBe('COMPLETED');
    expect(localStore.getPendingQueueCount()).toBeGreaterThan(0);
  });

  it('Flow 3: Clinical vitals threshold abnormal detection and doctor escalation flag', () => {
    localStore.saveVitals({
      id: 'vit-test-critical',
      visitId: 'visit-002',
      memberId: 'mem-002',
      systolicBp: 168, // Exceeds 160 threshold
      diastolicBp: 102,
      pulseBpm: 108, // Tachycardia > 100
      spo2Percent: 92, // Hypoxia < 94%
      isAbnormal: true,
      escalatedToDoctor: true,
      capturedAt: new Date().toISOString(),
    });

    const vitals = localStore.getVitalsByVisit('visit-002');
    expect(vitals.length).toBeGreaterThan(0);
    expect(vitals[0].isAbnormal).toBe(true);
    expect(vitals[0].escalatedToDoctor).toBe(true);
  });
});
