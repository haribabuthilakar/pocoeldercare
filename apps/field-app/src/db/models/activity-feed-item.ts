export interface ActivityFeedItemRecord {
  id: string;
  household_id: string;
  author_id: string;
  author_role: 'CARE_OFFICER' | 'FAMILY' | 'SYSTEM' | 'ADMIN';
  content: string;
  media_url?: string;
  created_at: number;
  synced: boolean;
}

export class ActivityFeedItemModel {
  static table = 'activity_feed_items';

  constructor(public raw: ActivityFeedItemRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get householdId(): string {
    return this.raw.household_id;
  }
  get authorId(): string {
    return this.raw.author_id;
  }
  get authorRole(): ActivityFeedItemRecord['author_role'] {
    return this.raw.author_role;
  }
  get content(): string {
    return this.raw.content;
  }
  get mediaUrl(): string | undefined {
    return this.raw.media_url;
  }
  get createdAt(): number {
    return this.raw.created_at;
  }
  get isSynced(): boolean {
    return this.raw.synced;
  }
}
