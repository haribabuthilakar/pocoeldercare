import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { database } from '../../src/db/database';
import { syncEngine } from '../../src/sync/sync-engine';
import { SyncStatusPill } from '../../src/components/sync/sync-status-pill';
import { ConflictReviewDrawer } from '../../src/components/sync/conflict-review-drawer';
import { populateMockDatabase } from '../fixtures/database.fixture';

describe('Two-Phase Batch Sync Engine & Conflict Review Suite', () => {
  beforeEach(async () => {
    await database.clearAll();
    syncEngine.clearConflicts();
    syncEngine.setOnline(true);
    vi.clearAllMocks();
  });

  describe('SyncEngine Core Operations', () => {
    beforeEach(async () => {
      await populateMockDatabase();
    });

    it('processes clean batch sync, marks local entities synced, and purges outbox', async () => {
      // Stage 2 mutations
      await database.stageMutation('STATUS_TRANSITION', 'service_requests', 'sr_field_001', {
        type: 'START_WORK',
      });
      await database.stageMutation('SOP_PROGRESS', 'sop_progress', 'prog_001', {
        isCompleted: true,
      });

      expect(database.syncOutbox.count).toBe(2);

      const result = await syncEngine.sync('co_prof_001');

      expect(result).not.toBeNull();
      expect(result?.acceptedIds.length).toBe(2);
      expect(result?.rejected.length).toBe(0);
      expect(database.syncOutbox.count).toBe(0);

      const progress = await database.sopProgress.find('prog_001');
      expect(progress?.isSynced).toBe(true);
    });

    it('detects server rejection, records conflict, and keeps item in outbox with CONFLICT status', async () => {
      // Stage a conflicting mutation
      const mutation = await database.stageMutation(
        'STATUS_TRANSITION',
        'service_requests',
        'sr_field_001',
        {
          type: 'COMPLETE_WORK',
          simulateConflict: true,
        },
      );

      const result = await syncEngine.sync('co_prof_001');

      expect(result).not.toBeNull();
      expect(result?.acceptedIds.length).toBe(0);
      expect(result?.rejected.length).toBe(1);

      const state = syncEngine.getState();
      expect(state.conflicts.length).toBe(1);
      expect(state.conflicts[0].id).toBe(mutation.id);
      expect(state.conflicts[0].errorMessage).toContain('Entity was modified by Operations');

      const outboxItem = await database.syncOutbox.find(mutation.id);
      expect(outboxItem?.status).toBe('CONFLICT');
    });

    it('resolves conflict with RELOAD_SERVER by applying server state and clearing conflict', async () => {
      const mutation = await database.stageMutation(
        'STATUS_TRANSITION',
        'service_requests',
        'sr_field_001',
        {
          type: 'COMPLETE_WORK',
          simulateConflict: true,
        },
      );

      await syncEngine.sync('co_prof_001');
      expect(syncEngine.getState().conflicts.length).toBe(1);

      await syncEngine.resolveConflict(mutation.id, 'RELOAD_SERVER');

      expect(syncEngine.getState().conflicts.length).toBe(0);
      expect(database.syncOutbox.count).toBe(0);

      const sr = await database.serviceRequests.find('sr_field_001');
      expect(sr?.status).toBe('CANCELLED');
    });

    it('resolves conflict with FORCE_OVERRIDE by re-queueing and syncing override payload', async () => {
      const mutation = await database.stageMutation(
        'STATUS_TRANSITION',
        'service_requests',
        'sr_field_001',
        {
          type: 'COMPLETE_WORK',
          simulateConflict: true,
        },
      );

      await syncEngine.sync('co_prof_001');
      expect(syncEngine.getState().conflicts.length).toBe(1);

      await syncEngine.resolveConflict(mutation.id, 'FORCE_OVERRIDE');

      expect(syncEngine.getState().conflicts.length).toBe(0);
      expect(database.syncOutbox.count).toBe(0);
    });

    it('handles offline state and skips dispatch until reconnected', async () => {
      await database.stageMutation('FEED_NOTE', 'activity_feed_items', 'feed_001', {
        content: 'Offline note',
      });

      syncEngine.setOnline(false);

      const result = await syncEngine.sync('co_prof_001');
      expect(result).toBeNull();
      expect(syncEngine.getState().isOnline).toBe(false);
      expect(database.syncOutbox.count).toBe(1);
    });
  });

  describe('SyncStatusPill Component', () => {
    it('renders "Up to date" when online with zero pending changes and zero conflicts', () => {
      render(<SyncStatusPill />);
      expect(screen.getByTestId('sync-status-synced')).toHaveTextContent('Up to date');
    });

    it('renders "Offline" badge when network is disconnected', () => {
      syncEngine.setOnline(false);
      render(<SyncStatusPill />);
      expect(screen.getByTestId('sync-status-offline')).toHaveTextContent('Offline');
    });

    it('renders conflict count badge and triggers onOpenConflicts callback when clicked', async () => {
      await database.stageMutation('STATUS_TRANSITION', 'service_requests', 'sr_field_001', {
        type: 'COMPLETE_WORK',
        simulateConflict: true,
      });
      await syncEngine.sync('co_prof_001');

      const onOpen = vi.fn();
      render(<SyncStatusPill onOpenConflicts={onOpen} />);

      const conflictBtn = screen.getByTestId('sync-status-conflicts');
      expect(conflictBtn).toHaveTextContent('1 Conflict');

      fireEvent.click(conflictBtn);
      expect(onOpen).toHaveBeenCalled();
    });
  });

  describe('ConflictReviewDrawer Component', () => {
    it('renders empty state when there are no active conflicts', () => {
      render(<ConflictReviewDrawer />);
      expect(screen.getByTestId('empty-conflicts-state')).toBeInTheDocument();
      expect(screen.getByText('No Sync Conflicts')).toBeInTheDocument();
    });

    it('renders conflict cards with diff view and resolution actions', async () => {
      const mutation = await database.stageMutation(
        'STATUS_TRANSITION',
        'service_requests',
        'sr_field_001',
        {
          type: 'COMPLETE_WORK',
          simulateConflict: true,
        },
      );
      await syncEngine.sync('co_prof_001');

      render(<ConflictReviewDrawer />);

      expect(screen.getByTestId(`conflict-card-${mutation.id}`)).toBeInTheDocument();
      expect(screen.getByText('Your Local Changes')).toBeInTheDocument();
      expect(screen.getByText('Current Server State')).toBeInTheDocument();
      expect(screen.getByTestId(`resolve-reload-${mutation.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`resolve-override-${mutation.id}`)).toBeInTheDocument();
    });

    it('handles "Keep Server Version" action from drawer UI', async () => {
      const mutation = await database.stageMutation(
        'STATUS_TRANSITION',
        'service_requests',
        'sr_field_001',
        {
          type: 'COMPLETE_WORK',
          simulateConflict: true,
        },
      );
      await syncEngine.sync('co_prof_001');

      render(<ConflictReviewDrawer />);

      const reloadBtn = screen.getByTestId(`resolve-reload-${mutation.id}`);
      fireEvent.click(reloadBtn);

      await waitFor(() => {
        expect(screen.getByTestId('empty-conflicts-state')).toBeInTheDocument();
      });
    });
  });
});
