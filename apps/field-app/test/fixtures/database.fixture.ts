import type { HouseholdRecord } from '../../src/db/models/household';
import type { SeniorRecord } from '../../src/db/models/senior';
import type { TicketRecord } from '../../src/db/models/ticket';
import type { ServiceRequestRecord } from '../../src/db/models/service-request';
import type { SopStepRecord } from '../../src/db/models/sop-step';
import type { SopProgressRecord } from '../../src/db/models/sop-progress';
import type { ActivityFeedItemRecord } from '../../src/db/models/activity-feed-item';
import { database } from '../../src/db/database';

export const mockHousehold: HouseholdRecord = {
  id: 'hh_blr_001',
  name: 'Varma Household',
  address_line1: 'Flat 402, Palm Meadows, 100ft Road',
  address_line2: 'Indiranagar',
  city: 'Bengaluru',
  pincode: '560038',
  latitude: 12.9716,
  longitude: 77.6412,
  status: 'ACTIVE',
  assigned_care_officer_id: 'co_prof_001',
  created_at: Date.now() - 86400000 * 7,
  updated_at: Date.now() - 86400000,
};

export const mockSenior: SeniorRecord = {
  id: 'snr_blr_001',
  household_id: 'hh_blr_001',
  full_name: 'Kalyan Varma',
  date_of_birth: '1952-04-15',
  gender: 'MALE',
  blood_group: 'B+',
  allergies: ['Penicillin', 'Sulfa drugs'],
  preferred_hospital: 'Manipal Hospital, HAL Airport Rd',
  emergency_contact_name: 'Ananya Varma (Daughter)',
  emergency_contact_phone: '+919845012345',
  is_primary: true,
};

export const mockTicket: TicketRecord = {
  id: 'tkt_field_001',
  household_id: 'hh_blr_001',
  senior_id: 'snr_blr_001',
  category: 'ROUTINE_CHECKUP',
  status: 'IN_PROGRESS',
  triage_status: 'CONFIRMED',
  assigned_care_officer_id: 'co_prof_001',
  description: 'Monthly Senior Health & Vitals Checkup Visit',
  response_due_at: new Date(Date.now() + 86400000).toISOString(),
  created_at: Date.now() - 3600000 * 4,
};

export const mockServiceRequest: ServiceRequestRecord = {
  id: 'sr_field_001',
  ticket_id: 'tkt_field_001',
  service_catalog_version_id: 'scv_vitals_01',
  title: 'Monthly Vitals & Physical Assessment',
  status: 'SCHEDULED',
  scheduled_for: new Date().toISOString(),
  sop_version_id: 'sop_vitals_v1',
};

export const mockSopSteps: SopStepRecord[] = [
  {
    id: 'sop_step_1',
    sop_version_id: 'sop_vitals_v1',
    step_index: 1,
    title: 'Senior Identity Verification & Greeting',
    description: 'Confirm senior identity, establish rapport, and ensure senior is comfortable.',
    input_type: 'CHECKBOX',
    is_mandatory: true,
  },
  {
    id: 'sop_step_2',
    sop_version_id: 'sop_vitals_v1',
    step_index: 2,
    title: 'Record Clinical Vitals',
    description: 'Measure and record Blood Pressure, Pulse, Blood Sugar, SpO2, and Temperature.',
    input_type: 'VITALS',
    is_mandatory: true,
    validation_rules: {
      vitalsFields: ['bp_systolic', 'bp_diastolic', 'pulse', 'blood_sugar', 'spo2', 'temperature'],
    },
  },
  {
    id: 'sop_step_3',
    sop_version_id: 'sop_vitals_v1',
    step_index: 3,
    title: 'Medication Inventory Audit',
    description: 'Review prescription pill organizer and log remaining weekly supply.',
    input_type: 'CHOICE',
    is_mandatory: true,
    validation_rules: {
      allowedChoices: ['Full (7+ days)', 'Low (2-3 days)', 'Depleted (Requires refill)'],
    },
  },
  {
    id: 'sop_step_4',
    sop_version_id: 'sop_vitals_v1',
    step_index: 4,
    title: 'Home Safety & Assessment Photo Proof',
    description: 'Capture photo of medicine kit or living area for family verification.',
    input_type: 'PHOTO',
    is_mandatory: false,
    validation_rules: {
      maxPhotoCount: 3,
    },
  },
];

export const mockSopProgress: SopProgressRecord[] = [
  {
    id: 'prog_001',
    service_request_id: 'sr_field_001',
    sop_step_id: 'sop_step_1',
    is_completed: true,
    completed_at: new Date().toISOString(),
    synced: true,
  },
];

export const mockActivityFeedItems: ActivityFeedItemRecord[] = [
  {
    id: 'feed_item_001',
    household_id: 'hh_blr_001',
    author_id: 'co_prof_001',
    author_role: 'CARE_OFFICER',
    content: 'Completed morning vitals checkup. Kalyan uncle is cheerful and vitals are stable.',
    created_at: Date.now() - 3600000 * 2,
    synced: true,
  },
  {
    id: 'feed_item_002',
    household_id: 'hh_blr_001',
    author_id: 'usr_fam_001',
    author_role: 'FAMILY',
    content: 'Thank you Rajesh! Please remind him to take his evening blood pressure tablet.',
    created_at: Date.now() - 3600000,
    synced: true,
  },
];

export async function populateMockDatabase(): Promise<void> {
  await database.clearAll();
  await database.households.batchInsert([mockHousehold]);
  await database.seniors.batchInsert([mockSenior]);
  await database.tickets.batchInsert([mockTicket]);
  await database.serviceRequests.batchInsert([mockServiceRequest]);
  await database.sopSteps.batchInsert(mockSopSteps);
  await database.sopProgress.batchInsert(mockSopProgress);
  await database.activityFeedItems.batchInsert(mockActivityFeedItems);
}
