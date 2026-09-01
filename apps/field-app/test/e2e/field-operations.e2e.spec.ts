import { describe, it, expect, beforeEach, vi } from 'vitest';
import { database } from '../../src/db/database';
import { syncEngine } from '../../src/sync/sync-engine';
import { mediaUploadManager } from '../../src/media/media-upload-manager';
import {
  mockHousehold,
  mockSenior,
  mockTicket,
  mockServiceRequest,
  mockSopSteps,
} from '../fixtures/database.fixture';
import { mockFieldSession } from '../fixtures/field-session.fixture';
import { evaluateVitalsRange } from '../../src/components/seniors/vitals-entry-form';
import { calculateDistanceMeters } from '../../src/components/visits/geofence-status';

describe('End-to-End Field Operations Lifecycle', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
    localStorage.setItem('poco_field_pin', '1234');
    localStorage.setItem('poco_field_locked', 'false');
    await database.clearAll();
    syncEngine.clearConflicts();
    syncEngine.setOnline(true);
    mediaUploadManager.setMockUploader(undefined);
    vi.clearAllMocks();
  });

  it('executes full offline home visit workflow from check-in to SOP completion, activation, and batch sync', async () => {
    // =========================================================================
    // STEP 1: INITIAL BOOTSTRAP & SYNC
    // =========================================================================
    await database.households.batchInsert([
      { ...mockHousehold, status: 'PENDING_ONBOARDING' },
    ]);
    await database.seniors.batchInsert([mockSenior]);
    await database.tickets.batchInsert([mockTicket]);
    await database.serviceRequests.batchInsert([
      { ...mockServiceRequest, status: 'SCHEDULED' },
    ]);
    await database.sopSteps.batchInsert(mockSopSteps);

    expect(database.households.count).toBe(1);
    expect(database.serviceRequests.count).toBe(1);
    expect(database.sopSteps.count).toBe(4);

    // =========================================================================
    // STEP 2: ENTER OFFLINE MODE IN THE FIELD
    // =========================================================================
    syncEngine.setOnline(false);
    expect(syncEngine.getState().isOnline).toBe(false);

    // =========================================================================
    // STEP 3: START VISIT WITH SILENT GPS GEOFENCE AUDIT
    // =========================================================================
    const officerGPS = { latitude: 12.9718, longitude: 77.6414 };
    const householdGPS = {
      latitude: mockHousehold.latitude || 12.9716,
      longitude: mockHousehold.longitude || 77.6412,
    };
    const distanceMeters = calculateDistanceMeters(officerGPS, householdGPS);
    expect(distanceMeters).toBeLessThan(100); // Verified within zone

    // Update SR status to ON_SITE
    await database.serviceRequests.update('sr_field_001', { status: 'ON_SITE' });
    await database.stageMutation('STATUS_TRANSITION', 'service_requests', 'sr_field_001', {
      type: 'START_WORK',
      isGeofenceVerified: true,
      distanceMeters,
      latitude: officerGPS.latitude,
      longitude: officerGPS.longitude,
      timestamp: new Date().toISOString(),
    });

    const activeSR = await database.serviceRequests.find('sr_field_001');
    expect(activeSR?.status).toBe('ON_SITE');
    expect(database.syncOutbox.count).toBe(1);

    // =========================================================================
    // STEP 4: EXECUTE SEQUENTIAL SOP CHECKLIST WIZARD
    // =========================================================================
    // Step 1: Senior Identity Verification & Greeting
    const p1 = await database.sopProgress.create({
      service_request_id: 'sr_field_001',
      sop_step_id: 'sop_step_1',
      is_completed: true,
      notes: 'Verified senior photo ID and greeted Kalyan uncle.',
      completed_at: new Date().toISOString(),
      synced: false,
    });
    await database.stageMutation('SOP_PROGRESS', 'sop_progress', p1.id, {
      serviceRequestId: 'sr_field_001',
      sopStepId: 'sop_step_1',
      isCompleted: true,
    });

    // Step 2: Record Clinical Vitals with range evaluation
    const clinicalVitals = {
      bpSystolic: 122,
      bpDiastolic: 80,
      pulse: 74,
      bloodSugar: 115,
      spo2: 98,
      temperature: 98.6,
    };
    const vitalsRanges = evaluateVitalsRange(clinicalVitals);
    expect(vitalsRanges.bpStatus).toBe('normal');
    expect(vitalsRanges.spo2Status).toBe('normal');

    const p2 = await database.sopProgress.create({
      service_request_id: 'sr_field_001',
      sop_step_id: 'sop_step_2',
      is_completed: true,
      notes: JSON.stringify(clinicalVitals),
      completed_at: new Date().toISOString(),
      synced: false,
    });
    await database.stageMutation('SOP_PROGRESS', 'sop_progress', p2.id, {
      serviceRequestId: 'sr_field_001',
      sopStepId: 'sop_step_2',
      vitals: clinicalVitals,
      isCompleted: true,
    });

    // Step 3: Medication Inventory Audit
    const p3 = await database.sopProgress.create({
      service_request_id: 'sr_field_001',
      sop_step_id: 'sop_step_3',
      is_completed: true,
      choice_value: 'Full (7+ days)',
      notes: 'Pill organizer loaded for upcoming week.',
      completed_at: new Date().toISOString(),
      synced: false,
    });
    await database.stageMutation('SOP_PROGRESS', 'sop_progress', p3.id, {
      serviceRequestId: 'sr_field_001',
      sopStepId: 'sop_step_3',
      choiceValue: 'Full (7+ days)',
      isCompleted: true,
    });

    // Step 4: Capture & Stage Photo Proof
    const mockPhotoUri = 'file:///data/cache/onboarding_kit_photo.jpg';
    const upload = await mediaUploadManager.queueUpload(
      'sop_progress',
      'prog_sop_4',
      mockPhotoUri,
    );
    expect(upload.status).toBe('PENDING');

    const p4 = await database.sopProgress.create({
      id: 'prog_sop_4',
      service_request_id: 'sr_field_001',
      sop_step_id: 'sop_step_4',
      is_completed: true,
      proof_url: mockPhotoUri,
      completed_at: new Date().toISOString(),
      synced: false,
    });
    await database.stageMutation('SOP_PROGRESS', 'sop_progress', p4.id, {
      serviceRequestId: 'sr_field_001',
      sopStepId: 'sop_step_4',
      isCompleted: true,
      proofUrl: mockPhotoUri,
    });

    // Verify all 4 SOP steps are completed locally
    const allProgress = await database.sopProgress.query();
    expect(allProgress.length).toBe(4);
    expect(allProgress.every((p) => p.isCompleted)).toBe(true);

    // =========================================================================
    // STEP 5: ONBOARDING CONCLUSION -> ACTIVATE HOUSEHOLD
    // =========================================================================
    await database.households.update('hh_blr_001', { status: 'ACTIVE' });
    await database.stageMutation('HOUSEHOLD_ACTIVATE', 'households', 'hh_blr_001', {
      status: 'ACTIVE',
      activatedAt: new Date().toISOString(),
    });

    const activeHousehold = await database.households.find('hh_blr_001');
    expect(activeHousehold?.status).toBe('ACTIVE');

    // =========================================================================
    // STEP 6: FINISH VISIT WITH CLOSING REMARKS
    // =========================================================================
    await database.serviceRequests.update('sr_field_001', { status: 'COMPLETED' });
    await database.stageMutation('STATUS_TRANSITION', 'service_requests', 'sr_field_001', {
      type: 'COMPLETE_WORK',
      allSopStepsCompleted: true,
      notes: 'Initial onboarding visit completed successfully. Kalyan uncle in good health.',
      timestamp: new Date().toISOString(),
    });

    const finishedSR = await database.serviceRequests.find('sr_field_001');
    expect(finishedSR?.status).toBe('COMPLETED');

    // =========================================================================
    // STEP 7: COMPOSE OFFLINE ACTIVITY FEED NOTE FOR FAMILY
    // =========================================================================
    const feedItem = await database.activityFeedItems.create({
      household_id: 'hh_blr_001',
      author_id: 'co_prof_001',
      author_role: 'CARE_OFFICER',
      content: 'Onboarding visit complete! Vitals are BP 122/80, Sugar 115, SpO2 98%.',
      created_at: Date.now(),
      synced: false,
    });
    await database.stageMutation('FEED_NOTE', 'activity_feed_items', feedItem.id, {
      householdId: 'hh_blr_001',
      authorId: 'co_prof_001',
      content: feedItem.content,
      createdAt: Date.now(),
    });

    // Check outbox has accumulated offline mutations
    expect(database.syncOutbox.count).toBe(8);

    // =========================================================================
    // STEP 8: RECONNECT TO NETWORK -> ATOMIC BATCH SYNC & S3 UPLOAD
    // =========================================================================
    syncEngine.setOnline(true);
    expect(syncEngine.getState().isOnline).toBe(true);

    // Execute Batch Sync
    const syncResult = await syncEngine.sync('co_prof_001');
    expect(syncResult).not.toBeNull();
    expect(syncResult?.acceptedIds.length).toBe(8);
    expect(syncResult?.rejected.length).toBe(0);
    expect(database.syncOutbox.count).toBe(0);

    // Process S3 Media Uploads
    await mediaUploadManager.processQueue();

    const completedUpload = await database.mediaUploads.find(upload.id);
    expect(completedUpload?.status).toBe('COMPLETED');
    expect(completedUpload?.presignedUrl).toContain('https://storage.poco.care/');

    // Check that SopProgress photo step proof was updated with S3 URL
    const photoProg = await database.sopProgress.find('prog_sop_4');
    expect(photoProg?.proofUrl).toBe(completedUpload?.presignedUrl);

    // Final sync for photo URL proof linkage
    await syncEngine.sync('co_prof_001');

    // Verify system state is 100% clean and synchronized
    expect(syncEngine.getState().conflicts.length).toBe(0);
    expect(syncEngine.getState().pendingCount).toBe(0);
  });
});
