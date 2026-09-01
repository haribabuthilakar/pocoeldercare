import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogService } from '../src/modules/catalog/catalog.service';
import { ServiceCategory, PackageTier, SopProofType } from '@poco/constants';

describe('CatalogService & Versioning Integration', () => {
  let service: CatalogService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      serviceCatalog: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      serviceCatalogVersion: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      package: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      packageVersion: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      packageServiceQuota: {
        create: vi.fn(),
      },
      sopStepVersion: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(prismaMock)),
    };
    service = new CatalogService(prismaMock as any);
  });

  describe('CATL-01 & CATL-05: Immutable Service Catalog Versioning', () => {
    it('publishes a new service version closing effectiveTo on previous version', async () => {
      const mockService = {
        id: 'svc-1',
        code: 'MED_ASSIST_VISIT',
        name: 'Medical Assistance Visit',
        versions: [{ id: 'v1', version: 1, pricePaise: 50000, effectiveTo: null }],
      };

      prismaMock.serviceCatalog.findUnique.mockResolvedValue(mockService);
      prismaMock.serviceCatalogVersion.create.mockResolvedValue({
        id: 'v2',
        serviceCatalogId: 'svc-1',
        version: 2,
        pricePaise: 65000,
        effectiveFrom: new Date(),
      });

      const newVersion = await service.publishServiceVersion('svc-1', {
        pricePaise: 65000,
        estimatedDurationMinutes: 90,
        requiredCertifications: ['BLS_CPR'],
        sopSteps: [
          { stepOrder: 1, title: 'Check Blood Pressure', isRequired: true, proofType: SopProofType.TEXT },
        ],
      });

      expect(newVersion.version).toBe(2);
      expect(prismaMock.serviceCatalogVersion.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { effectiveTo: expect.any(Date) },
      });
      expect(prismaMock.sopStepVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          serviceCatalogVersionId: 'v2',
          title: 'Check Blood Pressure',
          stepOrder: 1,
        }),
      });
    });

    it('resolves grandfathered service version retaining historical pricing (CATL-04)', async () => {
      prismaMock.serviceCatalogVersion.findUnique.mockResolvedValue({
        id: 'v1-grandfathered',
        version: 1,
        pricePaise: 40000,
        serviceCatalog: { name: 'Doctor Home Visit' },
        sopSteps: [],
      });

      const resolved = await service.resolveServiceVersion('v1-grandfathered');
      expect(resolved.id).toBe('v1-grandfathered');
      expect(resolved.pricePaise).toBe(40000);
      expect(resolved.serviceCatalog.name).toBe('Doctor Home Visit');
    });
  });

  describe('CATL-02 & CATL-03: Immutable Package Versioning & Quotas', () => {
    it('publishes a new package version with updated monthly quotas', async () => {
      const mockPkg = {
        id: 'pkg-1',
        code: 'KAVACH',
        name: 'Kavach Plan',
        tier: PackageTier.KAVACH,
        versions: [{ id: 'pkg-v1', version: 1, monthlyPricePaise: 199900, effectiveTo: null }],
      };

      prismaMock.package.findUnique.mockResolvedValue(mockPkg);
      prismaMock.packageVersion.create.mockResolvedValue({
        id: 'pkg-v2',
        packageId: 'pkg-1',
        version: 2,
        monthlyPricePaise: 249900,
        yearlyPricePaise: 2499000,
      });

      const newPkgVersion = await service.publishPackageVersion('pkg-1', {
        monthlyPricePaise: 249900,
        yearlyPricePaise: 2499000,
        quotas: [
          { serviceCatalogId: 'svc-visit', monthlyUnits: 4 },
          { serviceCatalogId: 'svc-vitals', monthlyUnits: 8 },
        ],
      });

      expect(newPkgVersion.version).toBe(2);
      expect(prismaMock.packageVersion.update).toHaveBeenCalledWith({
        where: { id: 'pkg-v1' },
        data: { effectiveTo: expect.any(Date) },
      });
      expect(prismaMock.packageServiceQuota.create).toHaveBeenCalledTimes(2);
    });

    it('resolves grandfathered package version with historical quotas (CATL-03)', async () => {
      prismaMock.packageVersion.findUnique.mockResolvedValue({
        id: 'pkg-v1-old',
        version: 1,
        monthlyPricePaise: 199900,
        package: { name: 'Kavach Legacy' },
        serviceQuotas: [
          { serviceCatalogId: 'svc-visit', monthlyUnits: 2, serviceCatalog: { name: 'Care Visit' } },
        ],
      });

      const resolved = await service.resolvePackageVersion('pkg-v1-old');
      expect(resolved.id).toBe('pkg-v1-old');
      expect(resolved.monthlyPricePaise).toBe(199900);
      expect(resolved.serviceQuotas[0].monthlyUnits).toBe(2);
    });
  });
});