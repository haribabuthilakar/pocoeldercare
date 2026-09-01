import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { OperationsTriageQueueView } from '@/app/admin/triage/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { mockPendingTriageTickets } from '../fixtures/tickets.fixture';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/triage',
}));

describe('OperationsTriageQueueView — Triage Queue & Quick Approve', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ticket list with AI confidence scores, priority, and emergency flags', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockPendingTriageTickets);

    render(
      <AdminProviders>
        <OperationsTriageQueueView />
      </AdminProviders>
    );

    // Verify loading or data rendered
    await waitFor(() => {
      expect(screen.getByText('Wearable Fall Alert Detected')).toBeInTheDocument();
    });

    expect(screen.getByText('Monthly BP & Diabetes Refill Assistance')).toBeInTheDocument();
    expect(screen.getByText('Inquiry regarding mobility ramp installation')).toBeInTheDocument();

    // Verify AI confidence chips
    expect(screen.getByText('(96%)')).toBeInTheDocument();
    expect(screen.getByText('(88%)')).toBeInTheDocument();
    expect(screen.getByText('(62%)')).toBeInTheDocument();

    // Verify Emergency badge on fall alert
    expect(screen.getByText('EMERGENCY')).toBeInTheDocument();
  });

  it('executes 1-click Quick Approve for high-confidence suggestions', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockPendingTriageTickets);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'SUCCESS' });

    render(
      <AdminProviders>
        <OperationsTriageQueueView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Quick Approve')[0]).toBeInTheDocument();
    });

    // Click the first Quick Approve button (for tkt-001-emergency)
    const quickApproveButtons = screen.getAllByText('Quick Approve');
    fireEvent.click(quickApproveButtons[0]);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/tickets/tkt-001-emergency/triage',
        expect.objectContaining({
          items: [
            {
              serviceCatalogVersionId: 'sv-version-emergency-01',
              notes: 'Quick-approved AI suggestion from triage queue',
            },
          ],
          isEmergency: true,
        })
      );
    });
  });

  it('opens Edit Modal, decomposes into multiple child service requests, and submits', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockPendingTriageTickets);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'SUCCESS' });

    render(
      <AdminProviders>
        <OperationsTriageQueueView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Wearable Fall Alert Detected')).toBeInTheDocument();
    });

    // Open edit modal for ticket 1
    const editButtons = screen.getAllByRole('button', { name: /Edit ticket/i });
    fireEvent.click(editButtons[0]);

    // Check modal opened
    expect(screen.getByText('Customize Triage Decomposition')).toBeInTheDocument();

    // Click Add Service Item to decompose into 2 items
    const addItemBtn = screen.getByRole('button', { name: /Add Service Item/i });
    fireEvent.click(addItemBtn);

    expect(screen.getByText('Child Service Requests (2)')).toBeInTheDocument();

    // Submit decomposition
    const confirmBtn = screen.getByRole('button', { name: /Confirm Triage/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/tickets/tkt-001-emergency/triage',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ serviceCatalogVersionId: 'sv-version-emergency-01' }),
            expect.objectContaining({ serviceCatalogVersionId: 'sv-version-general-01' }),
          ]),
        })
      );
    });
  });

  it('renders exact copywriting contract for empty queue', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);

    render(
      <AdminProviders>
        <OperationsTriageQueueView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('No Pending Tickets')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'All incoming tickets and AI-classified messages have been triaged. Check back shortly or refresh.'
      )
    ).toBeInTheDocument();
  });
});
