import { localStore, SyncMutation } from './sqlite-client';

export class SyncWorker {
  private static isOnlineStatus: boolean = true;
  private static isSyncing: boolean = false;
  private static listeners: ((isOnline: boolean, pendingCount: number) => void)[] = [];

  static setOnline(online: boolean) {
    this.isOnlineStatus = online;
    this.notifyListeners();
    if (online) {
      this.drainQueue();
    }
  }

  static isOnline(): boolean {
    return this.isOnlineStatus;
  }

  static getPendingCount(): number {
    return localStore.getPendingQueueCount();
  }

  static subscribe(listener: (isOnline: boolean, pendingCount: number) => void) {
    this.listeners.push(listener);
    listener(this.isOnlineStatus, this.getPendingCount());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach((l) => l(this.isOnlineStatus, this.getPendingCount()));
  }

  static async drainQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || !this.isOnlineStatus) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    const queue = localStore.getQueue();
    let synced = 0;
    let failed = 0;

    for (const mutation of queue) {
      try {
        // Simulate API call sync with NestJS Core API
        await new Promise((resolve) => setTimeout(resolve, 80));
        localStore.removeMutation(mutation.id);
        synced++;
      } catch (err) {
        mutation.retryCount += 1;
        failed++;
      }
    }

    this.isSyncing = false;
    this.notifyListeners();
    return { synced, failed };
  }
}
