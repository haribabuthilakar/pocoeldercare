import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ServiceCategoryName, PlanTierName } from '@poco/database';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('services')
  async listServices(
    @Query('category') category?: ServiceCategoryName,
    @Query('planTier') planTier?: PlanTierName,
  ) {
    return this.catalogService.listServices(category, planTier);
  }

  @Get('services/:code')
  async getServiceByCode(@Param('code') code: string) {
    return this.catalogService.getServiceByCode(code);
  }

  @Get('plans')
  async listPlanTiers() {
    return this.catalogService.listPlanTiers();
  }
}
