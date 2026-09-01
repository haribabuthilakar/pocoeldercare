export interface TicketRecord {
  id: string;
  household_id: string;
  senior_id?: string;
  category: string;
  status: 'PENDING_TRIAGE' | 'OPEN' | 'IN_PROGRESS' | 'WAITING_OPS_UPDATE' | 'RESOLVED' | 'CLOSED';
  triage_status: string;
  assigned_care_officer_id: string;
  description: string;
  response_due_at?: string;
  created_at: number;
}

export class TicketModel {
  static table = 'tickets';

  constructor(public raw: TicketRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get householdId(): string {
    return this.raw.household_id;
  }
  get seniorId(): string | undefined {
    return this.raw.senior_id;
  }
  get category(): string {
    return this.raw.category;
  }
  get status(): TicketRecord['status'] {
    return this.raw.status;
  }
  get triageStatus(): string {
    return this.raw.triage_status;
  }
  get assignedCareOfficerId(): string {
    return this.raw.assigned_care_officer_id;
  }
  get description(): string {
    return this.raw.description;
  }
  get responseDueAt(): string | undefined {
    return this.raw.response_due_at;
  }
}
