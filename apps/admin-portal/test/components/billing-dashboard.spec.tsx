import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { BillingDashboardView } from '@/app/admin/billing/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { BillingTransactionType } from '@poco/constants';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/billing',
}));

const mockBillingData = {
  mrrPaise: 12500000, // ₹125,000.00
  activeSubscriptionsCount: 25,
  totalWalletBalancePaise: 4500000, // ₹45,000.00
  totalOverdraftDebtPaise: 350000, // ₹3,500.00
  overdraftAccounts: [
    {
      householdId: 'hh-overdraft-01',
      householdName: 'Mehta Residence',
      city: 'Mumbai',
      primaryContactPhone: '+919820123456',
      negativeBalancePaise: -350000,
      lastEmergencyTicketId: 'tkt-emergency-99',
      daysOverdrawn: 9,
    },
  ],
  recentTransactions: [
    {
      id: 'tx-001',
      householdId: 'hh-001',
      householdName: 'Rao Household',
      type: BillingTransactionType.WALLET_CREDIT,
      amountPaise: 200000,
      description: 'Razorpay UPI top-up',
      createdAt: new Date('2026-08-30').toISOString(),
    },
    {
      id: 'tx-002',
      householdId: 'hh-overdraft-01',
      householdName: 'Mehta Residence',
      type: BillingTransactionType.EMERGENCY_OVERDRAFT,
      amountPaise: 350000,
      description: 'Emergency ICU Transport auto-debit',
      createdAt: new Date('2026-08-22').toISOString(),
    },
  ],
};

describe('BillingDashboardView — Financial Metrics, Overdrafts & Invoices', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders MRR, wallet balance, and overdraft debt formatted in INR', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockBillingData);

    render(
      <AdminProviders>
        <BillingDashboardView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('₹1,25,000.00')).toBeInTheDocument();
    });

    expect(screen.getByText('25 active subscriptions')).toBeInTheDocument();
    expect(screen.getByText('₹45,000.00')).toBeInTheDocument();
    expect(screen.getByText('₹3,500.00')).toBeInTheDocument();
  });

  it('switches to Emergency Overdrafts tab and displays negative balance accounts', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockBillingData);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'ALERT_SENT' });

    render(
      <AdminProviders>
        <BillingDashboardView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Emergency Overdrafts')).toBeInTheDocument();
    });

    // Click Overdrafts tab
    fireEvent.click(screen.getByText('Emergency Overdrafts'));

    expect(screen.getByText('Mehta Residence')).toBeInTheDocument();
    expect(screen.getByText('-₹3500.00')).toBeInTheDocument();
    expect(screen.getByText('9 days')).toBeInTheDocument();

    // Click Low balance alert
    const alertBtn = screen.getByRole('button', { name: /Send Low Balance Alert/i });
    fireEvent.click(alertBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/billing/households/hh-overdraft-01/alert-overdraft',
        { channel: 'SMS_PUSH' }
      );
    });
  });

  it('opens monthly invoice preview modal and triggers download', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockBillingData);

    render(
      <AdminProviders>
        <BillingDashboardView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Invoice Preview')).toBeInTheDocument();
    });

    // Open sample invoice
    fireEvent.click(screen.getByText('Sample Invoice Preview'));

    expect(screen.getByText('Monthly Invoice Statement — #INV-2026-08-001')).toBeInTheDocument();
    expect(screen.getByText('₹7,668.82')).toBeInTheDocument();

    // Click download
    const downloadBtn = screen.getByRole('button', { name: /Download Monthly Invoice/i });
    fireEvent.click(downloadBtn);
  });
});
