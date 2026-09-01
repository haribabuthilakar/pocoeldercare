import { appSchema, type AppSchema } from './schema';
import { type HouseholdRecord, HouseholdModel } from './models/household';
import { type SeniorRecord, SeniorModel } from './models/senior';
import { type TicketRecord, TicketModel } from './models/ticket';
import { type ServiceRequestRecord, ServiceRequestModel } from './models/service-request';
import { type SopStepRecord, SopStepModel } from './models/sop-step';
import { type SopProgressRecord, SopProgressModel } from './models/sop-progress';
import { type ActivityFeedItemRecord, ActivityFeedItemModel } from './models/activity-feed-item';
import { type SyncOutboxRecord, SyncOutboxModel } from './models/sync-outbox';
import { type MediaUploadRecord, MediaUploadModel } from './models/media-upload';

export function generateUuid(): string {
  // RFC4122 v4 UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type TableName = keyof typeof appSchema.tables;

export class DatabaseCollection<T extends { id: string }, M> {
  private records: Map<string, T> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor(
    public readonly name: string,
    private readonly modelFactory: (raw: T) => M,
  ) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  async find(id: string): Promise<M | null> {
    const raw = this.records.get(id);
    return raw ? this.modelFactory(raw) : null;
  }

  async query(predicate?: (item: T) => boolean): Promise<M[]> {
    const all = Array.from(this.records.values());
    const filtered = predicate ? all.filter(predicate) : all;
    return filtered.map(this.modelFactory);
  }

  async create(data: Omit<T, 'id'> & { id?: string }): Promise<M> {
    const id = data.id || generateUuid();
    const record = { ...data, id } as T;
    this.records.set(id, record);
    this.notify();
    return this.modelFactory(record);
  }

  async update(id: string, updates: Partial<T>): Promise<M | null> {
    const existing = this.records.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.records.set(id, updated);
    this.notify();
    return this.modelFactory(updated);
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.records.delete(id);
    if (existed) this.notify();
    return existed;
  }

  async batchInsert(items: T[]): Promise<void> {
    items.forEach((item) => this.records.set(item.id, item));
    this.notify();
  }

  async clear(): Promise<void> {
    this.records.clear();
    this.notify();
  }

  get count(): number {
    return this.records.size;
  }
}

export class AppDatabase {
  public readonly schema: AppSchema = appSchema;

  public readonly households = new DatabaseCollection<HouseholdRecord, HouseholdModel>(
    'households',
    (r) => new HouseholdModel(r),
  );
  public readonly seniors = new DatabaseCollection<SeniorRecord, SeniorModel>(
    'seniors',
    (r) => new SeniorModel(r),
  );
  public readonly tickets = new DatabaseCollection<TicketRecord, TicketModel>(
    'tickets',
    (r) => new TicketModel(r),
  );
  public readonly serviceRequests = new DatabaseCollection<
    ServiceRequestRecord,
    ServiceRequestModel
  >('service_requests', (r) => new ServiceRequestModel(r));
  public readonly sopSteps = new DatabaseCollection<SopStepRecord, SopStepModel>(
    'sop_steps',
    (r) => new SopStepModel(r),
  );
  public readonly sopProgress = new DatabaseCollection<SopProgressRecord, SopProgressModel>(
    'sop_progress',
    (r) => new SopProgressModel(r),
  );
  public readonly activityFeedItems = new DatabaseCollection<
    ActivityFeedItemRecord,
    ActivityFeedItemModel
  >('activity_feed_items', (r) => new ActivityFeedItemModel(r));
  public readonly syncOutbox = new DatabaseCollection<SyncOutboxRecord, SyncOutboxModel>(
    'sync_outbox',
    (r) => new SyncOutboxModel(r),
  );
  public readonly mediaUploads = new DatabaseCollection<MediaUploadRecord, MediaUploadModel>(
    'media_uploads',
    (r) => new MediaUploadModel(r),
  );

  async stageMutation(
    mutationType: SyncOutboxRecord['mutation_type'],
    entityName: string,
    entityId: string,
    payload: Record<string, any>,
  ): Promise<SyncOutboxModel> {
    return this.syncOutbox.create({
      id: generateUuid(),
      mutation_type: mutationType,
      entity_name: entityName,
      entity_id: entityId,
      payload,
      status: 'PENDING',
      created_at: Date.now(),
      retry_count: 0,
    });
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.households.clear(),
      this.seniors.clear(),
      this.tickets.clear(),
      this.serviceRequests.clear(),
      this.sopSteps.clear(),
      this.sopProgress.clear(),
      this.activityFeedItems.clear(),
      this.syncOutbox.clear(),
      this.mediaUploads.clear(),
    ]);
  }
}

// Global database instance for the application
export const database = new AppDatabase();
export default database;
