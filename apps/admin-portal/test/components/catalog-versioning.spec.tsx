import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { ServiceCatalogStudioView } from '@/app/admin/catalog/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { SopProofType } from '@poco/constants';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/catalog',
}));

const mockCatalogData = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'General Elder Care Visit',
    code: 'GENERAL_CARE_VISIT',
    category: 'WELLNESS',
    currentVersion: 2,
    currentPricePaise: 49900, // ₹499.00
    currentEstimatedDurationMinutes: 60,
    currentRequiredCertifications: ['BLS_CPR'],
    activeSubscriberCount: 42,
    currentSopSteps: [
      {
        stepOrder: 1,
        title: 'Perform senior vitals check',
        description: 'BP and SpO2 recording',
        isRequired: true,
        proofType: SopProofType.PHOTO,
      },
    ],
    versions: [
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        version: 2,
        pricePaise: 49900,
        effectiveFrom: new Date('2026-06-01').toISOString(),
        effectiveTo: null,
        activeSubscriberCount: 30,
        requiredCertifications: ['BLS_CPR'],
      },
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        version: 1,
        pricePaise: 39900, // Grandfathered ₹399.00
        effectiveFrom: new Date('2025-01-01').toISOString(),
        effectiveTo: new Date('2026-05-31').toISOString(),
        activeSubscriberCount: 12,
        requiredCertifications: ['BLS_CPR'],
      },
    ],
  },
];

describe('ServiceCatalogStudioView — Version Bumping & Grandfathered Rate Cards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders service catalog table with formatted INR prices and current versions', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockCatalogData);

    render(
      <AdminProviders>
        <ServiceCatalogStudioView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('General Elder Care Visit')).toBeInTheDocument();
    });

    expect(screen.getByText('v2 (Active)')).toBeInTheDocument();
    expect(screen.getByText('₹499.00')).toBeInTheDocument();
    expect(screen.getByText('42 active')).toBeInTheDocument();
  });

  it('inspects historical versions and displays grandfathered subscriber counts', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockCatalogData);

    render(
      <AdminProviders>
        <ServiceCatalogStudioView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    // Click History button
    fireEvent.click(screen.getByText('History'));

    // Check version selector rendered
    expect(screen.getByText('Version History & Grandfathered Rates')).toBeInTheDocument();
    expect(screen.getByText('30 households')).toBeInTheDocument();

    // Select v1 historical version
    const versionSelect = screen.getByLabelText(/Select catalog version/i);
    fireEvent.change(versionSelect, { target: { value: 'b0000000-0000-0000-0000-000000000001' } });

    expect(screen.getByText('₹399.00')).toBeInTheDocument();
    expect(screen.getByText('12 households')).toBeInTheDocument();
  });

  it('opens Catalog Editor Drawer, converts rupee input to integer paise, and publishes new version', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockCatalogData);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'CREATED' });

    render(
      <AdminProviders>
        <ServiceCatalogStudioView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Bump Version')).toBeInTheDocument();
    });

    // Click Bump Version button
    fireEvent.click(screen.getByText('Bump Version'));

    expect(screen.getByText(/Bump Service Version \(v2 → v3\)/i)).toBeInTheDocument();

    // Update Price from 499.00 to 599.00
    const priceInput = screen.getByDisplayValue('499.00');
    fireEvent.change(priceInput, { target: { value: '599.00' } });

    // Submit form
    const publishBtn = screen.getByRole('button', { name: /Publish New Catalog Version/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/catalog/services/a0000000-0000-0000-0000-000000000001/versions',
        expect.objectContaining({
          serviceCatalogId: 'a0000000-0000-0000-0000-000000000001',
          pricePaise: 59900, // Converted to integer paise
          estimatedDurationMinutes: 60,
          requiredCertifications: ['BLS_CPR'],
        })
      );
    });
  });
});
