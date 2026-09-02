import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { ServiceCategory, PackageTier, SopProofType } from '@poco/constants';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCatalog() {
    const services = await this.prisma.serviceCatalog.findMany({
      where: { isActive: true },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          include: {
            sopSteps: {
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
      },
    });

    return services.map((s) => {
      const activeVersion = s.versions.find((v) => !v.effectiveTo) || s.versions[0];
      return {
        id: s.id,
        code: s.code,
        name: s.name,
        category: s.category,
        defaultIsEmergency: s.defaultIsEmergency,
        currentVersion: activeVersion?.version ?? 1,
        currentPricePaise: activeVersion?.pricePaise ?? 0,
        currentEstimatedDurationMinutes: activeVersion?.estimatedDurationMinutes ?? 60,
        currentRequiredCertifications: activeVersion?.requiredCertifications ?? [],
        currentSopSteps: activeVersion?.sopSteps ?? [],
        activeSubscriberCount: 0,
        versions: s.versions.map((v) => ({
          id: v.id,
          version: v.version,
          pricePaise: v.pricePaise,
          estimatedDurationMinutes: v.estimatedDurationMinutes,
          effectiveFrom: v.effectiveFrom.toISOString(),
          effectiveTo: v.effectiveTo ? v.effectiveTo.toISOString() : null,
          requiredCertifications: v.requiredCertifications,
        })),
        activeVersion: activeVersion
          ? {
              id: activeVersion.id,
              version: activeVersion.version,
              pricePaise: activeVersion.pricePaise,
              priceInr: activeVersion.pricePaise / 100,
              estimatedDurationMinutes: activeVersion.estimatedDurationMinutes,
              requiredCertifications: activeVersion.requiredCertifications,
              sopSteps: activeVersion.sopSteps,
            }
          : null,
      };
    });
  }

  async getActivePackages() {
    const packages = await this.prisma.package.findMany({
      where: { isActive: true },
      include: {
        versions: {
          where: { effectiveTo: null },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            serviceQuotas: {
              include: { serviceCatalog: true },
            },
          },
        },
      },
    });

    return packages.map((pkg) => {
      const activeVersion = pkg.versions[0];
      return {
        id: pkg.id,
        code: pkg.code,
        name: pkg.name,
        tier: pkg.tier,
        description: pkg.description,
        activeVersion: activeVersion
          ? {
              id: activeVersion.id,
              version: activeVersion.version,
              monthlyPricePaise: activeVersion.monthlyPricePaise,
              monthlyPriceInr: activeVersion.monthlyPricePaise / 100,
              yearlyPricePaise: activeVersion.yearlyPricePaise,
              yearlyPriceInr: activeVersion.yearlyPricePaise / 100,
              serviceQuotas: activeVersion.serviceQuotas.map((q) => ({
                serviceCatalogId: q.serviceCatalogId,
                serviceCode: q.serviceCatalog.code,
                serviceName: q.serviceCatalog.name,
                monthlyUnits: q.monthlyUnits,
              })),
            }
          : null,
      };
    });
  }

  async publishServiceVersion(
    serviceCatalogId: string,
    data: {
      pricePaise: number;
      estimatedDurationMinutes?: number;
      requiredCertifications?: string[];
      sopSteps?: Array<{
        stepOrder: number;
        title: string;
        description?: string;
        isRequired?: boolean;
        proofType?: SopProofType;
      }>;
    },
  ) {
    const service = await this.prisma.serviceCatalog.findUnique({
      where: { id: serviceCatalogId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!service) {
      throw new NotFoundException('Service catalog item not found');
    }

    const currentVersion = service.versions[0];
    const nextVersionNum = currentVersion ? currentVersion.version + 1 : 1;
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // Close previous version effectiveTo
      if (currentVersion) {
        await tx.serviceCatalogVersion.update({
          where: { id: currentVersion.id },
          data: { effectiveTo: now },
        });
      }

      // Create new immutable version
      const newVersion = await tx.serviceCatalogVersion.create({
        data: {
          serviceCatalogId,
          version: nextVersionNum,
          pricePaise: data.pricePaise,
          estimatedDurationMinutes: data.estimatedDurationMinutes ?? 60,
          requiredCertifications: data.requiredCertifications || [],
          effectiveFrom: now,
        },
      });

      if (data.sopSteps && data.sopSteps.length > 0) {
        for (const step of data.sopSteps) {
          await tx.sopStepVersion.create({
            data: {
              serviceCatalogVersionId: newVersion.id,
              stepOrder: step.stepOrder,
              title: step.title,
              description: step.description,
              isRequired: step.isRequired ?? true,
              proofType: step.proofType || SopProofType.NONE,
            },
          });
        }
      }

      return newVersion;
    });
  }

  async publishPackageVersion(
    packageId: string,
    data: {
      monthlyPricePaise: number;
      yearlyPricePaise: number;
      quotas: Array<{ serviceCatalogId: string; monthlyUnits: number }>;
    },
  ) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const currentVersion = pkg.versions[0];
    const nextVersionNum = currentVersion ? currentVersion.version + 1 : 1;
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      if (currentVersion) {
        await tx.packageVersion.update({
          where: { id: currentVersion.id },
          data: { effectiveTo: now },
        });
      }

      const newVersion = await tx.packageVersion.create({
        data: {
          packageId,
          version: nextVersionNum,
          monthlyPricePaise: data.monthlyPricePaise,
          yearlyPricePaise: data.yearlyPricePaise,
          effectiveFrom: now,
        },
      });

      for (const q of data.quotas) {
        await tx.packageServiceQuota.create({
          data: {
            packageVersionId: newVersion.id,
            serviceCatalogId: q.serviceCatalogId,
            monthlyUnits: q.monthlyUnits,
          },
        });
      }

      return newVersion;
    });
  }

  async resolveServiceVersion(serviceCatalogVersionId: string) {
    const version = await this.prisma.serviceCatalogVersion.findUnique({
      where: { id: serviceCatalogVersionId },
      include: {
        serviceCatalog: true,
        sopSteps: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!version) {
      throw new NotFoundException('Service catalog version not found');
    }

    return version;
  }

  async resolvePackageVersion(packageVersionId: string) {
    const version = await this.prisma.packageVersion.findUnique({
      where: { id: packageVersionId },
      include: {
        package: true,
        serviceQuotas: {
          include: { serviceCatalog: true },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('Package version not found');
    }

    return version;
  }
}
