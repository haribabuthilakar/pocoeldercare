import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FamilyRole, LeadStage } from '@poco/constants';

@Controller('family/v1/onboarding')
export class OnboardingController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async createOnboardingLead(
    @Body()
    body: {
      name: string;
      phone: string;
      email?: string;
      city?: string;
      notes?: string;
    },
  ) {
    // ONBD-01: Auto create lead owned by sales
    const lead = await this.prisma.lead.create({
      data: {
        contactName: body.name,
        phone: body.phone,
        email: body.email,
        city: body.city || 'Bengaluru',
        stage: LeadStage.NEW,
        notes: body.notes || 'Family onboarding signup lead',
      },
    });

    return {
      leadId: lead.id,
      stage: lead.stage,
      message: 'Onboarding lead initiated',
    };
  }

  @Post('household')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async setupHousehold(
    @CurrentUser() user: any,
    @Body()
    body: {
      householdName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
      seniors: Array<{
        name: string;
        dateOfBirth: string | Date;
        gender: string;
        bloodGroup?: string;
        medicalProfile?: {
          allergies?: string[];
          chronicConditions?: string[];
          abhaId?: string;
          iceContactName: string;
          iceContactPhone: string;
          iceRelationship: string;
          notes?: string;
        };
      }>;
    },
  ) {
    // ONBD-02: 1-4 seniors validation
    if (!body.seniors || body.seniors.length === 0 || body.seniors.length > 4) {
      throw new BadRequestException('A household onboarding requires between 1 and 4 seniors');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create household
      const household = await tx.household.create({
        data: {
          name: body.householdName,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2,
          city: body.city,
          state: body.state,
          postalCode: body.postalCode,
          latitude: body.latitude ?? 12.9716,
          longitude: body.longitude ?? 77.5946,
          wallet: {
            create: {
              balancePaise: 0,
              creditLimitPaise: 0,
            },
          },
        },
      });

      // Link caller as primary contact membership
      await tx.householdMembership.create({
        data: {
          personId: user.sub,
          householdId: household.id,
          role: FamilyRole.PRIMARY_CAREGIVER,
          isPrimaryContact: true,
        },
      });

      // Create seniors & medical profiles
      for (const s of body.seniors) {
        const senior = await tx.senior.create({
          data: {
            householdId: household.id,
            name: s.name,
            dateOfBirth: new Date(s.dateOfBirth),
            gender: s.gender,
            bloodGroup: s.bloodGroup,
          },
        });

        if (s.medicalProfile) {
          await tx.seniorMedicalProfile.create({
            data: {
              seniorId: senior.id,
              allergies: s.medicalProfile.allergies || [],
              chronicConditions: s.medicalProfile.chronicConditions || [],
              abhaId: s.medicalProfile.abhaId,
              iceContactName: s.medicalProfile.iceContactName,
              iceContactPhone: s.medicalProfile.iceContactPhone,
              iceRelationship: s.medicalProfile.iceRelationship,
              notes: s.medicalProfile.notes,
            },
          });
        }
      }

      return {
        householdId: household.id,
        name: household.name,
        seniorCount: body.seniors.length,
      };
    });
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitOnboarding(
    @CurrentUser() user: any,
    @Body() body: { leadId?: string; householdId: string },
  ) {
    // ONBD-03: Transition lead from Sales to Customer Success in converted / pending status
    if (body.leadId) {
      await this.prisma.lead.update({
        where: { id: body.leadId },
        data: {
          stage: LeadStage.CONVERTED,
          convertedHouseholdId: body.householdId,
          notes: 'Onboarding completed by customer, handed off to Customer Success team',
        },
      });
    }

    return {
      status: 'PENDING_CS_HANDOFF',
      householdId: body.householdId,
      message: 'Onboarding submitted successfully. Customer Success team notified.',
    };
  }
}
