import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ServiceCategoryName, PlanTierName } from '@poco/database';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listServices(category?: ServiceCategoryName, planTier?: PlanTierName) {
    return this.prisma.serviceCatalog.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(planTier
          ? {
              planQuotas: {
                some: {
                  planTier: { name: planTier },
                  OR: [{ includedUnitsYear: { gt: 0 } }, { isUnlimited: true }],
                },
              },
            }
          : {}),
      },
      include: {
        planQuotas: {
          include: { planTier: true },
        },
        sopTemplates: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: { serviceNumber: 'asc' },
    });
  }

  async getServiceByCode(code: string) {
    const service = await this.prisma.serviceCatalog.findUnique({
      where: { code },
      include: {
        planQuotas: {
          include: { planTier: true },
        },
        sopTemplates: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with code ${code} not found`);
    }

    return service;
  }

  async listPlanTiers() {
    return this.prisma.planTier.findMany({
      include: {
        quotas: {
          include: { serviceCatalog: true },
          orderBy: { serviceCatalog: { serviceNumber: 'asc' } },
        },
      },
    });
  }
}
