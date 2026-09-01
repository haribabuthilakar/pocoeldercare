export interface SopProgressRecord {
  id: string;
  service_request_id: string;
  sop_step_id: string;
  is_completed: boolean;
  proof_url?: string;
  notes?: string;
  choice_value?: string;
  completed_at?: string;
  synced: boolean;
}

export class SopProgressModel {
  static table = 'sop_progress';

  constructor(public raw: SopProgressRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get serviceRequestId(): string {
    return this.raw.service_request_id;
  }
  get sopStepId(): string {
    return this.raw.sop_step_id;
  }
  get isCompleted(): boolean {
    return this.raw.is_completed;
  }
  get proofUrl(): string | undefined {
    return this.raw.proof_url;
  }
  get notes(): string | undefined {
    return this.raw.notes;
  }
  get choiceValue(): string | undefined {
    return this.raw.choice_value;
  }
  get completedAt(): string | undefined {
    return this.raw.completed_at;
  }
  get isSynced(): boolean {
    return this.raw.synced;
  }
}
