export interface SyncOutboxRecord {
  id: string;
  mutation_type:
    | 'STATUS_TRANSITION'
    | 'SOP_PROGRESS'
    | 'FEED_NOTE'
    | 'HOUSEHOLD_ACTIVATE'
    | 'VITALS_RECORD';
  entity_name: string;
  entity_id: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  created_at: number;
  retry_count: number;
  error_message?: string;
}

export class SyncOutboxModel {
  static table = 'sync_outbox';

  constructor(public raw: SyncOutboxRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get mutationType(): SyncOutboxRecord['mutation_type'] {
    return this.raw.mutation_type;
  }
  get entityName(): string {
    return this.raw.entity_name;
  }
  get entityId(): string {
    return this.raw.entity_id;
  }
  get payload(): Record<string, any> {
    return this.raw.payload;
  }
  get status(): SyncOutboxRecord['status'] {
    return this.raw.status;
  }
  get createdAt(): number {
    return this.raw.created_at;
  }
  get retryCount(): number {
    return this.raw.retry_count;
  }
  get errorMessage(): string | undefined {
    return this.raw.error_message;
  }
}
