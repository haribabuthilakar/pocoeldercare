const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', relPath);
}

// -------------------------------------------------------------
// 1. HOUSEHOLDS MODULE
// -------------------------------------------------------------

writeFile('apps/api/src/modules/households/dto/create-household.dto.ts', `
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateHouseholdDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  addressLine: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\\+?[1-9]\\d{1,14}$/, { message: 'Primary phone must be a valid E.164 phone number' })
  primaryContactPhone: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsString()
  careOfficerId?: string;
}
`);

writeFile('apps/api/src/modules/households/dto/create-member.dto.ts', `
import { IsNotEmpty, IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  relationship: string;

  @IsOptional()
  @IsString()
  @Matches(/^\\+?[1-9]\\d{1,14}$/, { message: 'Phone must be a valid E.164 phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  abhaNumber?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;
}
`);

writeFile('apps/api/src/modules/households/dto/update-ice.dto.ts', `
import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class UpdateIceProfileDto {
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @IsOptional()
  @IsArray()
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;

  @IsOptional()
  @IsObject()
  baselineVitals?: {
    systolicBp?: number;
    diastolicBp?: number;
    pulse?: number;
    sugarFasting?: number;
  };

  @IsOptional()
  @IsString()
  preferredHospitalName?: string;

  @IsOptional()
  @IsString()
  preferredHospitalPhone?: string;

  @IsOptional()
  @IsString()
  preferredHospitalAddress?: string;

  @IsOptional()
  @IsString()
  emergencyNotes?: string;
}
`);

writeFile('apps/api/src/modules/households/households.service.ts', `
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateIceProfileDto } from './dto/update-ice.dto';

@Injectable()
export class HouseholdsService {
  private readonly logger = new Logger(HouseholdsService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async createHousehold(dto: CreateHouseholdDto) {
    const household = await this.prisma.household.create({
      data: {
        name: dto.name,
        city: dto.city,
        addressLine: dto.addressLine,
        postalCode: dto.postalCode,
        primaryContactPhone: dto.primaryContactPhone,
        timeZone: dto.timeZone || 'Asia/Kolkata',
        careOfficerId: dto.careOfficerId,
        wallet: {
          create: {
            balancePaise: 0,
          },
        },
      },
      include: {
        wallet: true,
        careOfficer: { select: { id: true, name: true, phone: true } },
      },
    });

    return household;
  }

  async getHouseholdById(id: string) {
    const household = await this.prisma.household.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            iceProfile: true,
            vitalsReadings: {
              take: 5,
              orderBy: { recordedAt: 'desc' },
            },
          },
        },
        wallet: true,
        subscriptions: {
          include: { planTier: true },
        },
        careOfficer: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!household) {
      throw new NotFoundException(\`Household \${id} not found\`);
    }

    return household;
  }

  async listHouseholds(city?: string) {
    return this.prisma.household.findMany({
      where: {
        ...(city ? { city } : {}),
      },
      include: {
        members: { select: { id: true, firstName: true, lastName: true } },
        subscriptions: { include: { planTier: true } },
        wallet: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addMember(householdId: string, dto: CreateMemberDto) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      throw new NotFoundException(\`Household \${householdId} not found\`);
    }

    const member = await this.prisma.member.create({
      data: {
        householdId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        relationship: dto.relationship,
        phone: dto.phone,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        abhaNumber: dto.abhaNumber,
        iceProfile: {
          create: {
            bloodGroup: dto.bloodGroup,
            allergies: [],
            chronicConditions: [],
            currentMedications: [],
            baselineVitals: {},
          },
        },
      },
      include: { iceProfile: true },
    });

    // Cache initial ICE profile in Redis
    if (member.iceProfile) {
      await this.cacheIceProfile(member.id, member.iceProfile);
    }

    return member;
  }

  async getMemberIceProfile(memberId: string) {
    // 1. Try Redis cache for ultra-fast < 2s lookup
    const cacheKey = \`ice:\${memberId}\`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.warn(\`Failed to parse cached ICE JSON: \${e}\`);
      }
    }

    // 2. Fetch from DB
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        iceProfile: true,
        household: {
          include: {
            careOfficer: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    if (!member || !member.iceProfile) {
      throw new NotFoundException(\`ICE Profile for member \${memberId} not found\`);
    }

    const response = {
      memberId: member.id,
      memberName: \`\${member.firstName} \${member.lastName}\`,
      phone: member.phone,
      householdId: member.householdId,
      householdAddress: member.household.addressLine,
      careOfficer: member.household.careOfficer,
      ...member.iceProfile,
    };

    // Cache in Redis for 1 hour
    await this.cacheIceProfile(memberId, response);

    return response;
  }

  async updateMemberIceProfile(memberId: string, dto: UpdateIceProfileDto) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { iceProfile: true },
    });

    if (!member) {
      throw new NotFoundException(\`Member \${memberId} not found\`);
    }

    const iceProfile = await this.prisma.iceProfile.upsert({
      where: { memberId },
      update: {
        ...dto,
        currentMedications: dto.currentMedications as any,
        baselineVitals: dto.baselineVitals as any,
        lastReviewedAt: new Date(),
      },
      create: {
        memberId,
        ...dto,
        allergies: dto.allergies || [],
        chronicConditions: dto.chronicConditions || [],
        currentMedications: (dto.currentMedications as any) || [],
        baselineVitals: (dto.baselineVitals as any) || {},
      },
    });

    // Invalidate and refresh cache
    await this.cacheIceProfile(memberId, iceProfile);

    return iceProfile;
  }

  private async cacheIceProfile(memberId: string, data: any) {
    const cacheKey = \`ice:\${memberId}\`;
    await this.redisService.set(cacheKey, JSON.stringify(data), 3600);
  }
}
`);

writeFile('apps/api/src/modules/households/households.controller.ts', `
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateIceProfileDto } from './dto/update-ice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('households')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async createHousehold(@Body() dto: CreateHouseholdDto) {
    return this.householdsService.createHousehold(dto);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.DISPATCHER)
  async listHouseholds(@Query('city') city?: string) {
    return this.householdsService.listHouseholds(city);
  }

  @Get(':id')
  async getHousehold(@Param('id') id: string) {
    return this.householdsService.getHouseholdById(id);
  }

  @Post(':id/members')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async addMember(@Param('id') householdId: string, @Body() dto: CreateMemberDto) {
    return this.householdsService.addMember(householdId, dto);
  }

  @Get('members/:memberId/ice')
  async getMemberIce(@Param('memberId') memberId: string) {
    return this.householdsService.getMemberIceProfile(memberId);
  }

  @Put('members/:memberId/ice')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.CARE_OFFICER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI, RoleType.DOCTOR)
  async updateMemberIce(@Param('memberId') memberId: string, @Body() dto: UpdateIceProfileDto) {
    return this.householdsService.updateMemberIceProfile(memberId, dto);
  }
}
`);

writeFile('apps/api/src/modules/households/households.module.ts', `
import { Module } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { HouseholdsController } from './households.controller';

@Module({
  providers: [HouseholdsService],
  controllers: [HouseholdsController],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}
`);

// -------------------------------------------------------------
// 2. 90-SERVICE CATALOG MODULE
// -------------------------------------------------------------

writeFile('apps/api/src/modules/catalog/catalog.service.ts', `
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
      throw new NotFoundException(\`Service with code \${code} not found\`);
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
`);

writeFile('apps/api/src/modules/catalog/catalog.controller.ts', `
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
`);

writeFile('apps/api/src/modules/catalog/catalog.module.ts', `
import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';

@Module({
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
`);

// -------------------------------------------------------------
// 3. DYNAMIC SOP TEMPLATE ENGINE MODULE
// -------------------------------------------------------------

writeFile('apps/api/src/modules/sop/dto/create-sop.dto.ts', `
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SopStepDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  type: string; // 'BOOLEAN' | 'NUMBER' | 'PHOTO_URL' | 'VITALS' | 'SIGNATURE' | 'TEXT'

  @IsNotEmpty()
  required: boolean;
}

export class CreateSopTemplateDto {
  @IsNotEmpty()
  @IsString()
  serviceCatalogId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SopStepDto)
  steps: SopStepDto[];
}
`);

writeFile('apps/api/src/modules/sop/dto/evaluate-checklist.dto.ts', `
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class EvaluateChecklistDto {
  @IsNotEmpty()
  @IsString()
  sopTemplateId: string;

  @IsNotEmpty()
  @IsObject()
  completedSteps: Record<string, any>;
}
`);

writeFile('apps/api/src/modules/sop/sop.service.ts', `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSopTemplateDto } from './dto/create-sop.dto';
import { EvaluateChecklistDto } from './dto/evaluate-checklist.dto';

@Injectable()
export class SopService {
  constructor(private prisma: PrismaService) {}

  async createOrVersionSopTemplate(dto: CreateSopTemplateDto) {
    const service = await this.prisma.serviceCatalog.findUnique({
      where: { id: dto.serviceCatalogId },
      include: { sopTemplates: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!service) {
      throw new NotFoundException(\`Service catalog item \${dto.serviceCatalogId} not found\`);
    }

    const latestVersion = service.sopTemplates[0]?.version || 0;
    const nextVersion = latestVersion + 1;

    // Demote current template active status
    if (service.sopTemplates[0]) {
      await this.prisma.sopTemplate.update({
        where: { id: service.sopTemplates[0].id },
        data: { active: false },
      });
    }

    // Create new versioned template
    const newTemplate = await this.prisma.sopTemplate.create({
      data: {
        serviceCatalogId: dto.serviceCatalogId,
        version: nextVersion,
        title: dto.title,
        description: dto.description,
        active: true,
        jsonSchema: {
          steps: dto.steps as any,
        },
      },
    });

    return newTemplate;
  }

  async getSopTemplate(id: string) {
    const template = await this.prisma.sopTemplate.findUnique({
      where: { id },
      include: { serviceCatalog: true },
    });

    if (!template) {
      throw new NotFoundException(\`SOP template \${id} not found\`);
    }

    return template;
  }

  async getLatestSopForService(serviceCode: string) {
    const service = await this.prisma.serviceCatalog.findUnique({
      where: { code: serviceCode },
      include: {
        sopTemplates: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!service) {
      throw new NotFoundException(\`Service with code \${serviceCode} not found\`);
    }

    return service.sopTemplates[0] || null;
  }

  async evaluateChecklist(dto: EvaluateChecklistDto) {
    const template = await this.prisma.sopTemplate.findUnique({
      where: { id: dto.sopTemplateId },
    });

    if (!template) {
      throw new NotFoundException(\`SOP template \${dto.sopTemplateId} not found\`);
    }

    const schema = template.jsonSchema as any;
    const steps: any[] = schema?.steps || [];

    const errors: string[] = [];
    for (const step of steps) {
      if (step.required && (dto.completedSteps[step.id] === undefined || dto.completedSteps[step.id] === null)) {
        errors.push(\`Step '\${step.title}' (ID: \${step.id}) is required but was not completed.\`);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'SOP Checklist validation failed',
        errors,
      });
    }

    return {
      isValid: true,
      totalSteps: steps.length,
      completedCount: Object.keys(dto.completedSteps).length,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
`);

writeFile('apps/api/src/modules/sop/sop.controller.ts', `
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { SopService } from './sop.service';
import { CreateSopTemplateDto } from './dto/create-sop.dto';
import { EvaluateChecklistDto } from './dto/evaluate-checklist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('sop')
export class SopController {
  constructor(private readonly sopService: SopService) {}

  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER)
  async createTemplate(@Body() dto: CreateSopTemplateDto) {
    return this.sopService.createOrVersionSopTemplate(dto);
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.sopService.getSopTemplate(id);
  }

  @Get('service/:serviceCode')
  async getLatestSopForService(@Param('serviceCode') serviceCode: string) {
    return this.sopService.getLatestSopForService(serviceCode);
  }

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  async evaluateChecklist(@Body() dto: EvaluateChecklistDto) {
    return this.sopService.evaluateChecklist(dto);
  }
}
`);

writeFile('apps/api/src/modules/sop/sop.module.ts', `
import { Module } from '@nestjs/common';
import { SopService } from './sop.service';
import { SopController } from './sop.controller';

@Module({
  providers: [SopService],
  controllers: [SopController],
  exports: [SopService],
})
export class SopModule {}
`);

// -------------------------------------------------------------
// 4. APP MODULE & MAIN ENTRYPOINT
// -------------------------------------------------------------

writeFile('apps/api/src/app.module.ts', `
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HouseholdsModule } from './modules/households/households.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SopModule } from './modules/sop/sop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    HouseholdsModule,
    CatalogModule,
    SopModule,
  ],
})
export class AppModule {}
`);

writeFile('apps/api/src/main.ts', `
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefixes and middleware
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global filters, interceptors and validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(\`🚀 Pococare API Gateway running on: http://localhost:\${port}/api/v1\`);
}

bootstrap();
`);

console.log('Finished writing Households, Catalog, SOP, App Module, and Main entrypoint');

