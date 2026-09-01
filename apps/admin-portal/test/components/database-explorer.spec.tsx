import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import DatabaseExplorerPage from '@/app/admin/database/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { mockSuperAdmin, mockOpsManager } from '../fixtures/staff-session.fixture';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/database',
}));

const mockDbResponse = {
  model: 'seniors',
  total: 52,
  page: 1,
  pageSize: 25,
  records: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'K. V. Rao',
      aadhaarNumber: '1234-5678-9012', // Sensitive 12-digit Aadhaar to be masked
      gender: 'MALE',
      bloodGroup: 'O_POSITIVE',
      medicalProfile: {
        chronicConditions: ['HYPERTENSION', 'TYPE_2_DIABETES'],
        secretNotes: 'TokenAuthKey123',
      },
      createdAt: new Date('2026-08-01T10:00:00.000Z').toISOString(),
    },
  ],
};

describe('DatabaseExplorerView — Raw Table Inspection & PII Sanitization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('restricts access for non-SUPER_ADMIN users with warning banner', () => {
    render(
      <AdminProviders initialUser={mockOpsManager}>
        <DatabaseExplorerPage />
      </AdminProviders>
    );

    expect(
      screen.getByText('Access Restricted — Super Administrator Only')
    ).toBeInTheDocument();
    expect(screen.getByText('UNAUTHORIZED_ROLE')).toBeInTheDocument();
  });

  it('renders raw database table with sanitized PII for SUPER_ADMIN', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockDbResponse);

    render(
      <AdminProviders initialUser={mockSuperAdmin}>
        <DatabaseExplorerPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('K. V. Rao')).toBeInTheDocument();
    });

    // Verify Aadhaar masking: first 8 digits must be masked to XXXX-XXXX-9012
    expect(screen.getByText('XXXX-XXXX-9012')).toBeInTheDocument();
    expect(screen.queryByText('1234-5678-9012')).not.toBeInTheDocument();

    // Verify model tabs
    expect(screen.getByText('Households')).toBeInTheDocument();
    expect(screen.getByText('Seniors')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
  });

  it('opens expandable JSON viewer dialog and sanitizes secrets', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockDbResponse);

    render(
      <AdminProviders initialUser={mockSuperAdmin}>
        <DatabaseExplorerPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('{2 keys}')).toBeInTheDocument();
    });

    // Click JSON expander button
    fireEvent.click(screen.getByText('{2 keys}'));

    // Verify modal rendered
    expect(screen.getByText(/PII Sanitized/i)).toBeInTheDocument();
    expect(screen.getByText(/HYPERTENSION/i)).toBeInTheDocument();

    // Verify secret token redacted
    expect(screen.getByText(/\*\*\*REDACTED\*\*\*/i)).toBeInTheDocument();
  });
});
