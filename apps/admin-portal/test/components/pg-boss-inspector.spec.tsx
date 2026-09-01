import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { PgBossInspector } from '@/app/admin/integrations/components/pg-boss-inspector';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';

const mockQueueStatus = {
  activeCount: 3,
  completed24hCount: 1420,
  failedCount: 2,
  failedJobs: [
    {
      id: 'job-err-001-9988',
      name: 'sla-transition-checker',
      retryCount: 3,
      failedAt: new Date('2026-09-01T08:30:00Z').toISOString(),
      errorMessage: 'Database connection pool saturated (timeout 5000ms)',
    },
    {
      id: 'job-err-002-7744',
      name: 'wearable-ping-scanner',
      retryCount: 1,
      failedAt: new Date('2026-09-01T08:45:00Z').toISOString(),
      errorMessage: 'Partner 1mg gateway 502 Bad Gateway',
    },
  ],
};

describe('PgBossInspector — Queue Health, Retries & Purge', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders queue status metric tiles and failed job rows', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockQueueStatus);

    render(
      <AdminProviders>
        <PgBossInspector />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('sla-transition-checker')).toBeInTheDocument();
    });

    expect(screen.getByText('wearable-ping-scanner')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // active
    expect(screen.getByText('1420')).toBeInTheDocument(); // completed
    expect(screen.getByText('2')).toBeInTheDocument(); // failed
    expect(screen.getByText('Database connection pool saturated (timeout 5000ms)')).toBeInTheDocument();
  });

  it('triggers immediate retry for a failed job', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockQueueStatus);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'SCHEDULED' });

    render(
      <AdminProviders>
        <PgBossInspector />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Retry Failed Job/i })[0]).toBeInTheDocument();
    });

    const retryButtons = screen.getAllByRole('button', { name: /Retry Failed Job/i });
    fireEvent.click(retryButtons[0]!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/integrations/jobs/job-err-001-9988/retry'
      );
    });
  });

  it('opens confirmation modal and purges failed jobs', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockQueueStatus);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ count: 2 });

    render(
      <AdminProviders>
        <PgBossInspector />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Purge Failed Jobs/i })).toBeInTheDocument();
    });

    // Open purge confirmation modal
    fireEvent.click(screen.getByRole('button', { name: /Purge Failed Jobs/i }));

    expect(
      screen.getByText(/Purge Failed Jobs Confirmation/i)
    ).toBeInTheDocument();

    // Confirm purge
    const confirmBtn = screen.getByRole('button', { name: /Confirm Purge All/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/admin/v1/integrations/jobs/purge');
    });
  });

  it('renders exact copywriting contract for clean zero-error queue', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      activeCount: 0,
      completed24hCount: 500,
      failedCount: 0,
      failedJobs: [],
    });

    render(
      <AdminProviders>
        <PgBossInspector />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('No Failed Background Jobs')).toBeInTheDocument();
    });

    expect(
      screen.getByText('The pg-boss job queue is operating cleanly with zero failed tasks.')
    ).toBeInTheDocument();
  });
});
