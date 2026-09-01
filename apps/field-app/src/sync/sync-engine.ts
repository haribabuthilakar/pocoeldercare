import { database, DatabaseCollection } from '../db/database';
import type { SyncOutboxRecord } from '../db/models/sync-outbox';

export interface SyncConflict {
  id: string; // Outbox record ID
  mutationType: SyncOutboxRecord['mutation_type'];
  entityName: string;
  entityId: string;
  clientPayload: Record<string, any>;
  serverState?: Record<string, any>;
  errorMessage: string;
  occurredAt: number;
}

export interface SyncBatchRequest {
  careOfficerId: string;
  mutations: Array<{
    id: string;
    mutationType: SyncOutboxRecord['mutation_type'];
    entityName: string;
    entityId: string;
    payload: Record<string, any>;
    createdAt: number;
  }>;
}

export interface SyncBatchResponse {
  acceptedIds: string[];
  rejected: Array<{
    id: string;
    entityName: string;
    entityId: string;
    errorMessage: string;
    serverState?: Record<string, any>;
  }>;
  deltas?: {
    households?: any[];
    seniors?: any[];
    tickets?: any[];
    serviceRequests?: any[];
    sopProgress?: any[];
    activityFeedItems?: any[];
  };
}

export type SyncStateListener = (state: SyncEngineState) => void;

export interface SyncEngineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  conflicts: SyncConflict[];
  error: string | null;
}

export class SyncEngine {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private lastSyncedAt: number | null = null;
  private conflicts: Map<string, SyncConflict> = new Map();
  private lastError: string | null = null;
  private listeners: Set<SyncStateListener> = new Set();
  private mockApiHandler?: (req: SyncBatchRequest) => Promise<SyncBatchResponse>;

  constructor() {
    this.initNetworkListeners();
  }

  public setMockApiHandler(handler: (req: SyncBatchRequest) => Promise<SyncBatchResponse>) {
    this.mockApiHandler = handler;
  }

  private initNetworkListeners() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator?.onLine ?? true;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.sync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  public setOnline(online: boolean) {
    this.isOnline = online;
    this.notify();
    if (online) {
      this.sync();
    }
  }

  public subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): SyncEngineState {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: database.syncOutbox.count,
      lastSyncedAt: this.lastSyncedAt,
      conflicts: Array.from(this.conflicts.values()),
      error: this.lastError,
    };
  }

  public async sync(careOfficerId: string = 'co_prof_001'): Promise<SyncBatchResponse | null> {
    if (this.isSyncing) return null;
    if (!this.isOnline) {
      this.lastError = 'Offline';
      this.notify();
      return null;
    }

    const pendingMutations = await database.syncOutbox.query(
      (item) => item.status === 'PENDING' || item.status === 'FAILED',
    );

    if (pendingMutations.length === 0) {
      this.lastSyncedAt = Date.now();
      this.notify();
      return { acceptedIds: [], rejected: [] };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notify();

    try {
      // Mark items as SYNCING in local DB
      for (const m of pendingMutations) {
        await database.syncOutbox.update(m.id, { status: 'SYNCING' });
      }

      const requestPayload: SyncBatchRequest = {
        careOfficerId,
        mutations: pendingMutations.map((m) => ({
          id: m.id,
          mutationType: m.mutationType,
          entityName: m.entityName,
          entityId: m.entityId,
          payload: m.payload,
          createdAt: m.createdAt,
        })),
      };

      // Call API or mock handler
      let response: SyncBatchResponse;
      if (this.mockApiHandler) {
        response = await this.mockApiHandler(requestPayload);
      } else {
        // Default realistic batch sync processor
        response = await this.defaultSyncProcessor(requestPayload);
      }

      // Process accepted mutations
      for (const acceptedId of response.acceptedIds) {
        const outboxItem = await database.syncOutbox.find(acceptedId);
        if (outboxItem) {
          await this.markEntitySynced(outboxItem.entityName, outboxItem.entityId);
          await database.syncOutbox.delete(acceptedId);
          this.conflicts.delete(acceptedId);
        }
      }

      // Process rejected / conflicting mutations
      for (const rejected of response.rejected) {
        await database.syncOutbox.update(rejected.id, {
          status: 'CONFLICT',
          error_message: rejected.errorMessage,
        });

        const outboxItem = await database.syncOutbox.find(rejected.id);
        if (outboxItem) {
          const conflict: SyncConflict = {
            id: rejected.id,
            mutationType: outboxItem.mutationType,
            entityName: rejected.entityName,
            entityId: rejected.entityId,
            clientPayload: outboxItem.payload,
            serverState: rejected.serverState,
            errorMessage: rejected.errorMessage,
            occurredAt: Date.now(),
          };
          this.conflicts.set(rejected.id, conflict);
        }
      }

      // Apply server deltas if returned
      if (response.deltas) {
        await this.applyServerDeltas(response.deltas);
      }

      this.lastSyncedAt = Date.now();
      return response;
    } catch (err: any) {
      this.lastError = err?.message || 'Sync connection failed';
      // Revert SYNCING items back to FAILED
      for (const m of pendingMutations) {
        await database.syncOutbox.update(m.id, {
          status: 'FAILED',
          error_message: this.lastError || undefined,
        });
      }
      return null;
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  private async markEntitySynced(entityName: string, entityId: string) {
    if (entityName === 'sop_progress') {
      await database.sopProgress.update(entityId, { synced: true });
    } else if (entityName === 'activity_feed_items') {
      await database.activityFeedItems.update(entityId, { synced: true });
    }
  }

  private async applyServerDeltas(deltas: NonNullable<SyncBatchResponse['deltas']>) {
    if (deltas.households) await database.households.batchInsert(deltas.households);
    if (deltas.seniors) await database.seniors.batchInsert(deltas.seniors);
    if (deltas.tickets) await database.tickets.batchInsert(deltas.tickets);
    if (deltas.serviceRequests) await database.serviceRequests.batchInsert(deltas.serviceRequests);
    if (deltas.sopProgress) await database.sopProgress.batchInsert(deltas.sopProgress);
    if (deltas.activityFeedItems)
      await database.activityFeedItems.batchInsert(deltas.activityFeedItems);
  }

  private async defaultSyncProcessor(req: SyncBatchRequest): Promise<SyncBatchResponse> {
    // Default server-authoritative mock simulation
    const acceptedIds: string[] = [];
    const rejected: SyncBatchResponse['rejected'] = [];

    for (const mutation of req.mutations) {
      // Simulate conflict detection rule: if payload contains cancelConflict=true or already cancelled
      if (mutation.payload?.simulateConflict) {
        rejected.push({
          id: mutation.id,
          entityName: mutation.entityName,
          entityId: mutation.entityId,
          errorMessage: 'Conflict: Entity was modified by Operations Executive on server.',
          serverState: { status: 'CANCELLED', updatedBy: 'Operations Manager' },
        });
      } else {
        acceptedIds.push(mutation.id);
      }
    }

    return { acceptedIds, rejected };
  }

  public async resolveConflict(
    conflictId: string,
    resolution: 'RELOAD_SERVER' | 'FORCE_OVERRIDE',
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return;

    if (resolution === 'RELOAD_SERVER') {
      // Discard local change, apply server state if available, delete from outbox
      if (conflict.serverState) {
        if (conflict.entityName === 'service_requests') {
          await database.serviceRequests.update(conflict.entityId, conflict.serverState);
        } else if (conflict.entityName === 'households') {
          await database.households.update(conflict.entityId, conflict.serverState);
        }
      }
      await database.syncOutbox.delete(conflictId);
      this.conflicts.delete(conflictId);
    } else if (resolution === 'FORCE_OVERRIDE') {
      // Re-queue with override flag
      await database.syncOutbox.update(conflictId, {
        status: 'PENDING',
        payload: { ...conflict.clientPayload, forceOverride: true, simulateConflict: false },
      });
      this.conflicts.delete(conflictId);
      await this.sync();
    }

    this.notify();
  }

  public clearConflicts(): void {
    this.conflicts.clear();
    this.notify();
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
