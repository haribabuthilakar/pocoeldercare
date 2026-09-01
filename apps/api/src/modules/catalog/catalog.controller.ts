import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, SopProofType } from '@poco/constants';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('common/catalog')
  async getPublicCatalog() {
    return this.catalogService.getActiveCatalog();
  }

  @Get('common/catalog/services/:versionId')
  async getServiceVersion(@Param('versionId') versionId: string) {
    return this.catalogService.resolveServiceVersion(versionId);
  }

  @Post('admin/v1/catalog/services/:catalogId/versions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async publishServiceVersion(
    @Param('catalogId') catalogId: string,
    @Body()
    body: {
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
    return this.catalogService.publishServiceVersion(catalogId, body);
  }
}

@Controller()
export class PackagesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('common/packages')
  async getPublicPackages() {
    return this.catalogService.getActivePackages();
  }

  @Get('common/packages/:versionId')
  async getPackageVersion(@Param('versionId') versionId: string) {
    return this.catalogService.resolvePackageVersion(versionId);
  }

  @Post('admin/v1/catalog/packages/:packageId/versions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async publishPackageVersion(
    @Param('packageId') packageId: string,
    @Body()
    body: {
      monthlyPricePaise: number;
      yearlyPricePaise: number;
      quotas: Array<{ serviceCatalogId: string; monthlyUnits: number }>;
    },
  ) {
    return this.catalogService.publishPackageVersion(packageId, body);
  }
}
