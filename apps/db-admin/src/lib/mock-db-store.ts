import { TABLE_DEFINITIONS } from './table-schemas';

export type TableDataStore = Record<string, Record<string, any>[]>;

const initialData: TableDataStore = {
  User: [
    { id: 'usr-admin-01', name: 'Dr. Anand Raman (Admin)', phone: '+919876543210', email: 'anand.raman@pocoeldercare.com', isActive: true, createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-20T12:00:00.000Z' },
    { id: 'usr-officer-01', name: 'Ramesh Kumar (Care Officer)', phone: '+919845012345', email: 'ramesh.k@pocoeldercare.com', isActive: true, createdAt: '2026-08-05T09:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
    { id: 'usr-officer-02', name: 'Suresh Gowda (Care Officer)', phone: '+919845012346', email: 'suresh.g@pocoeldercare.com', isActive: true, createdAt: '2026-08-05T09:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
    { id: 'usr-doctor-01', name: 'Dr. Ananya Sen, MD', phone: '+919845099881', email: 'ananya.sen@apollomed.in', isActive: true, createdAt: '2026-08-10T11:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
    { id: 'usr-family-01', name: 'Arjun Menon (NRI Son)', phone: '+14155552671', email: 'arjun.menon@sftech.io', isActive: true, createdAt: '2026-08-12T04:00:00.000Z', updatedAt: '2026-08-21T08:00:00.000Z' },
  ],
  UserRoleMapping: [
    { id: 'urm-01', userId: 'usr-admin-01', role: 'ADMIN', householdId: null, createdAt: '2026-08-01T10:00:00.000Z' },
    { id: 'urm-02', userId: 'usr-officer-01', role: 'CARE_OFFICER', householdId: null, createdAt: '2026-08-05T09:00:00.000Z' },
    { id: 'urm-03', userId: 'usr-doctor-01', role: 'DOCTOR', householdId: null, createdAt: '2026-08-10T11:00:00.000Z' },
    { id: 'urm-04', userId: 'usr-family-01', role: 'FAMILY_PRIMARY_NRI', householdId: 'hh-blr-001', createdAt: '2026-08-12T04:00:00.000Z' },
  ],
  Household: [
    { id: 'hh-blr-001', name: 'Menon Residence', city: 'Bangalore', addressLine: '14/2, 12th Main, Indiranagar', postalCode: '560038', primaryContactPhone: '+919845011999', timeZone: 'Asia/Kolkata', careOfficerId: 'usr-officer-01', createdAt: '2026-08-12T04:00:00.000Z' },
    { id: 'hh-blr-002', name: 'Raghavan Residence', city: 'Bangalore', addressLine: '88, 4th Cross, Jayanagar 4th Block', postalCode: '560011', primaryContactPhone: '+919845233441', timeZone: 'Asia/Kolkata', careOfficerId: 'usr-officer-02', createdAt: '2026-08-14T08:00:00.000Z' },
  ],
  Member: [
    { id: 'mbr-001', householdId: 'hh-blr-001', firstName: 'Gopalakrishnan', lastName: 'Menon', phone: '+919845011999', relationship: 'FATHER', gender: 'MALE', abhaNumber: '91-4829-1029-4412', abhaStatus: 'LINKED', createdAt: '2026-08-12T04:00:00.000Z' },
    { id: 'mbr-002', householdId: 'hh-blr-002', firstName: 'Kalyani', lastName: 'Raghavan', phone: '+919845233441', relationship: 'MOTHER', gender: 'FEMALE', abhaNumber: '91-8832-4419-5502', abhaStatus: 'LINKED', createdAt: '2026-08-14T08:00:00.000Z' },
  ],
  IceProfile: [
    { id: 'ice-001', memberId: 'mbr-001', bloodGroup: 'O+', allergies: ['Penicillin', 'Sulfa drugs'], chronicConditions: ['Type 2 Diabetes', 'Hypertension'], currentMedications: ['Metformin 500mg', 'Telmisartan 40mg'], preferredHospitalName: 'Manipal Hospital Indiranagar', preferredHospitalPhone: '+91 80 2502 4444', active: true, lastReviewedAt: '2026-08-20T10:00:00.000Z' },
    { id: 'ice-002', memberId: 'mbr-002', bloodGroup: 'B+', allergies: ['NSAIDs'], chronicConditions: ['Osteoarthritis', 'Hypothyroidism'], currentMedications: ['Thyronorm 50mcg', 'Calcium D3'], preferredHospitalName: 'Apollo Speciality Jayanagar', preferredHospitalPhone: '+91 80 2630 4050', active: true, lastReviewedAt: '2026-08-20T10:00:00.000Z' },
  ],
  ServiceCatalog: [
    { id: 'sc-01', serviceNumber: 1, code: 'EMG-01', name: '24x7 Ambulance Dispatch & Paramedic Assist', category: 'A_EMERGENCY', unitPricePaise: 0, slaMinutes: 15, isPayPerUseOnly: false },
    { id: 'sc-02', serviceNumber: 2, code: 'CO-01', name: 'Bi-Weekly Field Officer Wellness Check-in', category: 'B_PRIMARY_CARE', unitPricePaise: 65000, slaMinutes: 30, isPayPerUseOnly: false },
    { id: 'sc-03', serviceNumber: 3, code: 'MED-03', name: 'Geriatrician Home Consultation Visit', category: 'B_PRIMARY_CARE', unitPricePaise: 150000, slaMinutes: 60, isPayPerUseOnly: true },
  ],
  PlanTier: [
    { id: 'tier-01', name: 'KAVACH', annualPricePaise: 2400000, description: '24x7 Emergency SLA & In-Person Verification' },
    { id: 'tier-02', name: 'SAHARA', annualPricePaise: 4800000, description: 'Primary Care, Doctor Home Visits & Monthly Vitals' },
    { id: 'tier-03', name: 'SAMPOORNA', annualPricePaise: 9600000, description: 'Comprehensive High-Touch Care with Daily Living' },
  ],
  PlanQuota: [
    { id: 'pq-01', planTierId: 'tier-01', serviceCatalogId: 'sc-01', includedUnitsYear: 999, isUnlimited: true },
    { id: 'pq-02', planTierId: 'tier-02', serviceCatalogId: 'sc-02', includedUnitsYear: 24, isUnlimited: false },
  ],
  Subscription: [
    { id: 'sub-01', householdId: 'hh-blr-001', planTierId: 'tier-02', status: 'ACTIVE', startDate: '2026-08-12T00:00:00.000Z', endDate: '2027-08-11T23:59:59.000Z', autoRenew: true },
  ],
  SubscriptionQuotaLedger: [
    { id: 'sql-01', subscriptionId: 'sub-01', serviceCatalogId: 'sc-02', totalAllocated: 24, usedUnits: 4, remainingUnits: 20 },
  ],
  Wallet: [
    { id: 'wal-01', householdId: 'hh-blr-001', balancePaise: 1850000, currency: 'INR', updatedAt: '2026-08-21T09:00:00.000Z' },
  ],
  WalletTransaction: [
    { id: 'tx-01', walletId: 'wal-01', amountPaise: 2500000, type: 'CREDIT', referenceType: 'NRI_RAZORPAY_TOPUP', description: 'Care Wallet Auto-Reload from Arjun Menon', createdAt: '2026-08-12T10:00:00.000Z' },
    { id: 'tx-02', walletId: 'wal-01', amountPaise: 650000, type: 'DEBIT', referenceType: 'SERVICE_PAYMENT', description: 'Payment for MED-03 Geriatrician Home Visit', createdAt: '2026-08-18T14:30:00.000Z' },
  ],
  SopTemplate: [
    { id: 'sop-01', serviceCatalogId: 'sc-02', version: 1, title: 'Bi-Weekly Field Wellness Protocol', description: 'Standard vitals recording, pill box check, and home safety survey', jsonSchema: { steps: ['Measure BP & SpO2', 'Inspect medicine strip counts', 'Check bathroom grip rails'] }, active: true },
  ],
  ServiceExecution: [
    { id: 'exec-01', householdId: 'hh-blr-001', memberId: 'mbr-001', serviceCatalogId: 'sc-02', assignedToUserId: 'usr-officer-01', status: 'COMPLETED', scheduledAt: '2026-08-19T10:00:00.000Z', isDrill: false, totalChargePaise: 65000 },
    { id: 'exec-02', householdId: 'hh-blr-001', memberId: 'mbr-001', serviceCatalogId: 'sc-03', assignedToUserId: 'usr-doctor-01', status: 'SCHEDULED', scheduledAt: '2026-08-22T14:00:00.000Z', isDrill: false, totalChargePaise: 150000 },
  ],
  ClinicalConsult: [
    { id: 'cc-01', serviceExecutionId: 'exec-01', memberId: 'mbr-001', doctorUserId: 'usr-doctor-01', consultType: 'DOCTOR_HOME_VISIT', chiefComplaint: 'Mild knee stiffness and routine diabetes follow-up', clinicalNotes: 'BP stable. Suggested knee strengthening exercises and updated Metformin dosage.', diagnosisIcd10: 'E11.9 (Type 2 Diabetes Mellitus)' },
  ],
  Prescription: [
    { id: 'rx-01', clinicalConsultId: 'cc-01', memberId: 'mbr-001', doctorUserId: 'usr-doctor-01', medicationItems: [{ drugName: 'Metformin XR', dosage: '500mg', frequency: '1-0-1 after meals', durationDays: 30 }], pdfUrl: '/rx/rx_menon_aug2026.pdf', issuedAt: '2026-08-19T11:00:00.000Z' },
  ],
  VitalsReading: [
    { id: 'vr-01', memberId: 'mbr-001', systolicBp: 128, diastolicBp: 82, bloodGlucoseMgDl: 134.0, fastingState: 'POST_PRANDIAL', pulseBpm: 72, spo2Percent: 98.0, isAbnormal: false, recordedAt: '2026-08-19T10:15:00.000Z' },
    { id: 'vr-02', memberId: 'mbr-002', systolicBp: 145, diastolicBp: 92, bloodGlucoseMgDl: 168.0, fastingState: 'FASTING', pulseBpm: 84, spo2Percent: 96.0, isAbnormal: true, recordedAt: '2026-08-20T09:30:00.000Z' },
  ],
  EmergencyEvent: [
    { id: 'emg-01', householdId: 'hh-blr-001', memberId: 'mbr-001', initiatedByPhone: '+919845011999', severity: 'CRITICAL', status: 'RESOLVED', outcomeSummary: 'Resolved at home with doctor follow-up scheduled. False alarm SOS pull.', createdAt: '2026-08-15T03:20:00.000Z' },
  ],
};

class MockDbStore {
  private data: TableDataStore = { ...initialData };
  private listeners: (() => void)[] = [];

  public getTableRows(tableName: string): Record<string, any>[] {
    return this.data[tableName] || [];
  }

  public getRow(tableName: string, id: string): Record<string, any> | undefined {
    const rows = this.getTableRows(tableName);
    return rows.find((r) => r.id === id);
  }

  public createRow(tableName: string, row: Record<string, any>): Record<string, any> {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    const newRecord = {
      id: row.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...row,
    };
    this.data[tableName].unshift(newRecord);
    this.notify();
    return newRecord;
  }

  public updateRow(tableName: string, id: string, updates: Record<string, any>): Record<string, any> | null {
    const rows = this.getTableRows(tableName);
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = {
      ...rows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data[tableName][index] = updated;
    this.notify();
    return updated;
  }

  public deleteRow(tableName: string, id: string): boolean {
    const rows = this.getTableRows(tableName);
    const initialLen = rows.length;
    this.data[tableName] = rows.filter((r) => r.id !== id);
    const deleted = this.data[tableName].length < initialLen;
    if (deleted) this.notify();
    return deleted;
  }

  public getCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    Object.keys(TABLE_DEFINITIONS).forEach((table) => {
      counts[table] = (this.data[table] || []).length;
    });
    return counts;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const dbStore = new MockDbStore();
