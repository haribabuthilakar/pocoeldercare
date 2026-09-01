import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { RollupExceptionsQueueView } from '@/app/admin/exceptions/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { mockRollupExceptionTickets } from '../fixtures/tickets.fixture';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/exceptions',
}));

describe('RollupExceptionsQueueView & RollupResolutionModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders rollup exception tickets and displays conflicting child count', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockRollupExceptionTickets);

    render(
      <AdminProviders>
        <RollupExceptionsQueueView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Comprehensive Bi-Weekly Wellness Check & Diagnostic Panel')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Deshmukh Household • Pune')).toBeInTheDocument();
    expect(screen.getByText('2 child requests')).toBeInTheDocument();
    expect(screen.getByText('1 exception')).toBeInTheDocument();
  });

  it('opens Rollup Resolution Modal with child status tree and submits reconciliation transition', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockRollupExceptionTickets);
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ status: 'RESOLVED' });

    render(
      <AdminProviders>
        <RollupExceptionsQueueView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Resolve Rollup')).toBeInTheDocument();
    });

    // Click Resolve Rollup button
    fireEvent.click(screen.getByText('Resolve Rollup'));

    // Check modal contents
    expect(screen.getByText('Reconcile Rollup Exception')).toBeInTheDocument();
    expect(screen.getByText('Physiotherapy Mobility Session')).toBeInTheDocument();
    expect(screen.getByText('Fasting Lipid & HbA1c Blood Panel')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('EXCEPTION')).toBeInTheDocument();

    // Type mandatory audit note
    const textarea = screen.getByPlaceholderText(/Explain the exception reconciliation rationale/i);
    fireEvent.change(textarea, {
      target: {
        value: 'Approved diagnostic re-draw while physiotherapy marked complete.',
      },
    });

    // Click Submit
    const submitBtn = screen.getByRole('button', { name: /Resolve Rollup Exception/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith(
        '/api/admin/v1/tickets/tkt-rollup-001/resolve-ops',
        {
          action: 'RESOLVE',
          notes: 'Approved diagnostic re-draw while physiotherapy marked complete.',
        }
      );
    });
  });

  it('renders exact copywriting contract for empty exceptions queue', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);

    render(
      <AdminProviders>
        <RollupExceptionsQueueView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('No Rollup Conflicts')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'All child service requests have reconciled cleanly to their parent tickets.'
      )
    ).toBeInTheDocument();
  });
});
