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
      throw new NotFoundException(`Service catalog item ${dto.serviceCatalogId} not found`);
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
      throw new NotFoundException(`SOP template ${id} not found`);
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
      throw new NotFoundException(`Service with code ${serviceCode} not found`);
    }

    return service.sopTemplates[0] || null;
  }

  async evaluateChecklist(dto: EvaluateChecklistDto) {
    const template = await this.prisma.sopTemplate.findUnique({
      where: { id: dto.sopTemplateId },
    });

    if (!template) {
      throw new NotFoundException(`SOP template ${dto.sopTemplateId} not found`);
    }

    const schema = template.jsonSchema as any;
    const steps: any[] = schema?.steps || [];

    const errors: string[] = [];
    for (const step of steps) {
      if (step.required && (dto.completedSteps[step.id] === undefined || dto.completedSteps[step.id] === null)) {
        errors.push(`Step '${step.title}' (ID: ${step.id}) is required but was not completed.`);
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
