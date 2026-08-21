export interface OfflineVisit {
  id: string;
  householdId: string;
  seniorName: string;
  seniorAge: number;
  seniorPhone: string;
  address: string;
  gpsCoords: { lat: number; lng: number };
  preferredHospital: string;
  emergencyPhone: string;
  planName: 'Kavach' | 'Sahara' | 'Sampoorna';
  scheduledTimeIST: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface OfflineVitalsReading {
  id: string;
  visitId: string;
  memberId: string;
  systolicBp: number;
  diastolicBp: number;
  pulseBpm: number;
  spo2Percent: number;
  glucoseMgDl?: number;
  glucoseType?: 'FASTING' | 'RANDOM' | 'POST_PRANDIAL';
  temperatureF?: number;
  weightKg?: number;
  isAbnormal: boolean;
  escalatedToDoctor: boolean;
  capturedAt: string;
}

export interface OfflineSopExecution {
  id: string;
  visitId: string;
  sopTemplateCode: string;
  stepResults: {
    stepId: string;
    stepName: string;
    category: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED';
    photoUri?: string;
    audioUri?: string;
    notes?: string;
  }[];
  durationSeconds: number;
  completedAt: string;
}

export interface SyncMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  retryCount: number;
  createdAt: string;
}

class LocalStoreManager {
  private visits: Map<string, OfflineVisit> = new Map();
  private vitals: Map<string, OfflineVitalsReading> = new Map();
  private sopExecutions: Map<string, OfflineSopExecution> = new Map();
  private mutationQueue: SyncMutation[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const mockVisits: OfflineVisit[] = [
      {
        id: 'visit-001',
        householdId: 'hh-blr-001',
        seniorName: 'Gopalakrishnan Menon',
        seniorAge: 79,
        seniorPhone: '+91 98450 12345',
        address: '#402, 12th Main, HAL 2nd Stage, Indiranagar, Bangalore',
        gpsCoords: { lat: 12.9716, lng: 77.6412 },
        preferredHospital: 'Manipal Hospital Old Airport Rd',
        emergencyPhone: '+91 80 2502 4444',
        planName: 'Sampoorna',
        scheduledTimeIST: '10:00 AM',
        status: 'PENDING',
      },
      {
        id: 'visit-002',
        householdId: 'hh-blr-002',
        seniorName: 'Kalyani Raghavan',
        seniorAge: 82,
        seniorPhone: '+91 98450 67890',
        address: 'B-304, Palm Meadows, Whitefield, Bangalore',
        gpsCoords: { lat: 12.9698, lng: 77.7499 },
        preferredHospital: 'Columbia Asia Whitefield',
        emergencyPhone: '+91 80 6165 6262',
        planName: 'Sahara',
        scheduledTimeIST: '02:30 PM',
        status: 'PENDING',
      },
    ];

    mockVisits.forEach((v) => this.visits.set(v.id, v));
  }

  // Visits CRUD
  getVisits(): OfflineVisit[] {
    return Array.from(this.visits.values());
  }

  getVisitById(id: string): OfflineVisit | undefined {
    return this.visits.get(id);
  }

  updateVisitStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    const visit = this.visits.get(id);
    if (visit) {
      visit.status = status;
      this.visits.set(id, visit);
    }
  }

  // Vitals CRUD & Mutation Enqueue
  saveVitals(reading: OfflineVitalsReading) {
    this.vitals.set(reading.id, reading);
    this.enqueueMutation({
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      endpoint: '/vitals/log',
      method: 'POST',
      payload: reading,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
  }

  getVitalsByVisit(visitId: string): OfflineVitalsReading[] {
    return Array.from(this.vitals.values()).filter((v) => v.visitId === visitId);
  }

  // SOP Executions CRUD & Mutation Enqueue
  saveSopExecution(exec: OfflineSopExecution) {
    this.sopExecutions.set(exec.id, exec);
    this.updateVisitStatus(exec.visitId, 'COMPLETED');
    this.enqueueMutation({
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      endpoint: '/catalog/sop/executions',
      method: 'POST',
      payload: exec,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
  }

  // Sync Mutation Queue
  enqueueMutation(mutation: SyncMutation) {
    this.mutationQueue.push(mutation);
  }

  getQueue(): SyncMutation[] {
    return [...this.mutationQueue];
  }

  getPendingQueueCount(): number {
    return this.mutationQueue.length;
  }

  clearQueue() {
    this.mutationQueue = [];
  }

  removeMutation(id: string) {
    this.mutationQueue = this.mutationQueue.filter((m) => m.id !== id);
  }
}

export const localStore = new LocalStoreManager();
