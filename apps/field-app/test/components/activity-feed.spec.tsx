import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { database } from '../../src/db/database';
import { syncEngine } from '../../src/sync/sync-engine';
import { ActivityFeedView } from '../../src/components/feed/activity-feed-view';
import { MessageComposer } from '../../src/components/feed/message-composer';
import { FeedScreen } from '../../src/app/feed/index';
import { populateMockDatabase, mockActivityFeedItems } from '../fixtures/database.fixture';
import { mockFieldSession } from '../fixtures/field-session.fixture';
import { ActivityFeedItemModel } from '../../src/db/models/activity-feed-item';

describe('Activity Feed & Offline Chat Outbox Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
    localStorage.setItem('poco_field_pin', '1234');
    localStorage.setItem('poco_field_locked', 'false');
    await database.clearAll();
    syncEngine.setOnline(true);
    vi.clearAllMocks();
  });

  describe('ActivityFeedView Component', () => {
    it('renders empty state when there are no care notes', () => {
      render(<ActivityFeedView items={[]} />);
      expect(screen.getByTestId('empty-feed-state')).toBeInTheDocument();
      expect(screen.getByText('No Care Notes Yet')).toBeInTheDocument();
    });

    it('renders feed items with author roles and sync status badges', () => {
      const items = mockActivityFeedItems.map((i) => new ActivityFeedItemModel(i));

      render(<ActivityFeedView items={items} />);

      expect(screen.getByText('Care Officer')).toBeInTheDocument();
      expect(screen.getByText('Family Member')).toBeInTheDocument();
      expect(
        screen.getByText(/Completed morning vitals checkup/),
      ).toBeInTheDocument();
      expect(screen.getByTestId('feed-synced-feed_item_001')).toBeInTheDocument();
    });

    it('renders pending clock badge for offline un-synced notes', () => {
      const offlineItem = new ActivityFeedItemModel({
        id: 'feed_offline_001',
        household_id: 'hh_blr_001',
        author_id: 'co_prof_001',
        author_role: 'CARE_OFFICER',
        content: 'Offline notes composed in field',
        created_at: Date.now(),
        synced: false,
      });

      render(<ActivityFeedView items={[offlineItem]} />);

      expect(screen.getByTestId('feed-pending-feed_offline_001')).toHaveTextContent(
        'Pending Sync',
      );
    });
  });

  describe('MessageComposer Component', () => {
    it('writes optimistic note to database and stages FEED_NOTE outbox mutation', async () => {
      syncEngine.setOnline(false);
      const onSent = vi.fn();

      render(<MessageComposer householdId="hh_blr_001" onMessageSent={onSent} />);

      const input = screen.getByTestId('message-composer-input');
      fireEvent.change(input, {
        target: { value: 'Senior finished lunch and took blood pressure meds.' },
      });

      const sendBtn = screen.getByTestId('send-message-button');
      fireEvent.click(sendBtn);

      await waitFor(async () => {
        expect(onSent).toHaveBeenCalled();
        expect(input).toHaveValue('');

        // Verify local DB write
        const items = await database.activityFeedItems.query();
        expect(items.length).toBe(1);
        expect(items[0]?.content).toBe(
          'Senior finished lunch and took blood pressure meds.',
        );
        expect(items[0]?.isSynced).toBe(false);

        // Verify outbox mutation
        const outbox = await database.syncOutbox.query();
        expect(outbox.length).toBe(1);
        expect(outbox[0]?.mutationType).toBe('FEED_NOTE');
        expect(outbox[0]?.payload.content).toBe(
          'Senior finished lunch and took blood pressure meds.',
        );
      });
    });
  });

  describe('FeedScreen Integration', () => {
    it('loads and displays household care notes and allows composing updates', async () => {
      await populateMockDatabase();

      render(<FeedScreen />);

      await waitFor(() => {
        expect(screen.getByTestId('feed-screen-container')).toBeInTheDocument();
        expect(
          screen.getByText(/Completed morning vitals checkup/),
        ).toBeInTheDocument();
      });

      // Compose note
      const input = screen.getByTestId('message-composer-input');
      fireEvent.change(input, {
        target: { value: 'Physiotherapy exercises performed smoothly.' },
      });
      fireEvent.click(screen.getByTestId('send-message-button'));

      await waitFor(() => {
        expect(
          screen.getByText('Physiotherapy exercises performed smoothly.'),
        ).toBeInTheDocument();
      });
    });
  });
});
