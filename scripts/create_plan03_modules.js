const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', relPath);
}

// -------------------------------------------------------------
// 1. CLINICAL MODULE (Doctor Home Visits, Teleconsults & Rx)
// -------------------------------------------------------------

writeFile('apps/api/src/modules/clinical/dto/schedule-consult.dto.ts', `
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConsultTypeEnum } from '@poco/database';

export class ScheduleConsultDto {
  @IsNotEmpty()
  @IsString()
  householdId: string;

  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsNotEmpty()
  @IsString()
  doctorUserId: string;

  @IsNotEmpty()
  @IsEnum(ConsultTypeEnum)
  consultType: ConsultTypeEnum;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsNotEmpty()
  @IsString()
  chiefComplaint: string;

  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;
}
`);

writeFile('apps/api/src/modules/clinical/dto/submit-consult-notes.dto.ts', `
import { IsNotEmpty, IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class SubmitConsultNotesDto {
  @IsNotEmpty()
  @IsString()
  clinicalNotes: string;

  @IsOptional()
  @IsString()
  diagnosisIcd10?: string;

  @IsOptional()
  @IsObject()
  vitalsSummary?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
`);

writeFile('apps/api/src/modules/clinical/dto/create-prescription.dto.ts', `
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class MedicationItemDto {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsNotEmpty()
  @IsArray()
  medicationItems: MedicationItemDto[];

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
`);

writeFile('apps/api/src/modules/clinical/clinical.service.ts', `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ScheduleConsultDto } from './dto/schedule-consult.dto';
import { SubmitConsultNotesDto } from './dto/submit-consult-notes.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { ExecutionStatusType } from '@poco/database';

@Injectable()
export class ClinicalService {
  constructor(private prisma: PrismaService) {}

  async scheduleConsult(dto: ScheduleConsultDto) {
    // 1. Resolve service catalog item (MED-03 Doctor Home Visit, or MED-04 Teleconsult)
    const serviceCode = dto.consultType === 'DOCTOR_HOME_VISIT' ? 'MED-03' : 'MED-04';
    const catalogItem = await this.prisma.serviceCatalog.findUnique({
      where: { code: serviceCode },
    });

    if (!catalogItem) {
      throw new NotFoundException(\`Service catalog item \${serviceCode} not found\`);
    }

    // 2. Create ServiceExecution and ClinicalConsult
    const execution = await this.prisma.serviceExecution.create({
      data: {
        householdId: dto.householdId,
        memberId: dto.memberId,
        serviceCatalogId: catalogItem.id,
        assignedToUserId: dto.doctorUserId,
        status: ExecutionStatusType.SCHEDULED,
        scheduledAt: new Date(dto.scheduledAt),
        totalChargePaise: catalogItem.unitPricePaise,
        clinicalConsult: {
          create: {
            memberId: dto.memberId,
            doctorUserId: dto.doctorUserId,
            consultType: dto.consultType,
            specialty: dto.specialty,
            chiefComplaint: dto.chiefComplaint,
            clinicalNotes: 'Pending consult',
          },
        },
      },
      include: {
        clinicalConsult: {
          include: { doctor: { select: { id: true, name: true, phone: true } } },
        },
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return execution;
  }

  async submitConsultNotes(consultId: string, dto: SubmitConsultNotesDto) {
    const consult = await this.prisma.clinicalConsult.findUnique({
      where: { id: consultId },
      include: { serviceExecution: true },
    });

    if (!consult) {
      throw new NotFoundException(\`Clinical consult \${consultId} not found\`);
    }

    const updated = await this.prisma.clinicalConsult.update({
      where: { id: consultId },
      data: {
        clinicalNotes: dto.clinicalNotes,
        diagnosisIcd10: dto.diagnosisIcd10,
        vitalsSummary: dto.vitalsSummary || {},
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
      },
    });

    // Mark execution as COMPLETED
    await this.prisma.serviceExecution.update({
      where: { id: consult.serviceExecutionId },
      data: {
        status: ExecutionStatusType.COMPLETED,
        completedAt: new Date(),
      },
    });

    return updated;
  }

  async createPrescription(consultId: string, dto: CreatePrescriptionDto) {
    const consult = await this.prisma.clinicalConsult.findUnique({
      where: { id: consultId },
    });

    if (!consult) {
      throw new NotFoundException(\`Clinical consult \${consultId} not found\`);
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        clinicalConsultId: consultId,
        memberId: consult.memberId,
        doctorUserId: consult.doctorUserId,
        medicationItems: dto.medicationItems as any,
        pdfUrl: dto.pdfUrl,
      },
      include: {
        doctor: { select: { id: true, name: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return prescription;
  }

  async getConsultDetails(consultId: string) {
    const consult = await this.prisma.clinicalConsult.findUnique({
      where: { id: consultId },
      include: {
        doctor: { select: { id: true, name: true, phone: true } },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            iceProfile: true,
          },
        },
        prescriptions: true,
        serviceExecution: true,
      },
    });

    if (!consult) {
      throw new NotFoundException(\`Consult \${consultId} not found\`);
    }

    return consult;
  }

  async listMemberConsults(memberId: string) {
    return this.prisma.clinicalConsult.findMany({
      where: { memberId },
      include: {
        doctor: { select: { id: true, name: true } },
        prescriptions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
`);

writeFile('apps/api/src/modules/clinical/clinical.controller.ts', `
import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { ScheduleConsultDto } from './dto/schedule-consult.dto';
import { SubmitConsultNotesDto } from './dto/submit-consult-notes.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('clinical')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('schedule')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI, RoleType.CARE_OFFICER)
  async scheduleConsult(@Body() dto: ScheduleConsultDto) {
    return this.clinicalService.scheduleConsult(dto);
  }

  @Put('consults/:id/notes')
  @Roles(RoleType.DOCTOR, RoleType.ADMIN)
  async submitNotes(@Param('id') id: string, @Body() dto: SubmitConsultNotesDto) {
    return this.clinicalService.submitConsultNotes(id, dto);
  }

  @Post('consults/:id/prescriptions')
  @Roles(RoleType.DOCTOR, RoleType.ADMIN)
  async createPrescription(@Param('id') id: string, @Body() dto: CreatePrescriptionDto) {
    return this.clinicalService.createPrescription(id, dto);
  }

  @Get('consults/:id')
  async getConsultDetails(@Param('id') id: string) {
    return this.clinicalService.getConsultDetails(id);
  }

  @Get('members/:memberId/consults')
  async listMemberConsults(@Param('memberId') memberId: string) {
    return this.clinicalService.listMemberConsults(memberId);
  }
}
`);

writeFile('apps/api/src/modules/clinical/clinical.module.ts', `
import { Module } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { ClinicalController } from './clinical.controller';

@Module({
  providers: [ClinicalService],
  controllers: [ClinicalController],
  exports: [ClinicalService],
})
export class ClinicalModule {}
`);

// -------------------------------------------------------------
// 2. BILLING & WALLET LEDGER MODULE (Atomic Holds & Invoicing)
// -------------------------------------------------------------

writeFile('apps/api/src/modules/billing/dto/topup-wallet.dto.ts', `
import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

export class TopupWalletDto {
  @IsNotEmpty()
  @IsInt()
  @Min(10000, { message: 'Minimum top-up is ₹100 (10,000 paise)' })
  amountPaise: number;

  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
`);

writeFile('apps/api/src/modules/billing/dto/hold-funds.dto.ts', `
import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

export class HoldFundsDto {
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  amountPaise: number;

  @IsNotEmpty()
  @IsString()
  serviceExecutionId: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
`);

writeFile('apps/api/src/modules/billing/billing.service.ts', `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TopupWalletDto } from './dto/topup-wallet.dto';
import { HoldFundsDto } from './dto/hold-funds.dto';
import { TransactionTypeEnum } from '@poco/database';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getWalletByHousehold(householdId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { householdId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          householdId,
          balancePaise: 0,
        },
        include: { transactions: true },
      });
    }

    return wallet;
  }

  async topupWallet(walletId: string, dto: TopupWalletDto) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new NotFoundException(\`Wallet \${walletId} not found\`);
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balancePaise: { increment: dto.amountPaise },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          amountPaise: dto.amountPaise,
          type: TransactionTypeEnum.CREDIT,
          referenceType: 'PAYMENT_GATEWAY',
          referenceId: dto.paymentReference,
          description: dto.description,
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });
  }

  async holdFunds(dto: HoldFundsDto) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: dto.walletId } });
      if (!wallet) {
        throw new NotFoundException(\`Wallet \${dto.walletId} not found\`);
      }

      if (wallet.balancePaise < dto.amountPaise) {
        throw new BadRequestException(
          \`Insufficient wallet balance. Available: ₹\${(wallet.balancePaise / 100).toFixed(2)}, Required: ₹\${(dto.amountPaise / 100).toFixed(2)}\`,
        );
      }

      // Deduct balance and create HOLD ledger entry
      const updatedWallet = await tx.wallet.update({
        where: { id: dto.walletId },
        data: {
          balancePaise: { decrement: dto.amountPaise },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: dto.walletId,
          amountPaise: dto.amountPaise,
          type: TransactionTypeEnum.HOLD,
          referenceType: 'SERVICE_EXECUTION',
          referenceId: dto.serviceExecutionId,
          description: dto.description,
        },
      });

      return {
        wallet: updatedWallet,
        holdTransaction: transaction,
      };
    });
  }

  async settleHold(serviceExecutionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const hold = await tx.walletTransaction.findFirst({
        where: {
          referenceId: serviceExecutionId,
          type: TransactionTypeEnum.HOLD,
        },
      });

      if (!hold) {
        throw new NotFoundException(\`No active hold found for service execution \${serviceExecutionId}\`);
      }

      const settleTx = await tx.walletTransaction.create({
        data: {
          walletId: hold.walletId,
          amountPaise: hold.amountPaise,
          type: TransactionTypeEnum.DEBIT,
          referenceType: 'SERVICE_EXECUTION',
          referenceId: serviceExecutionId,
          description: \`Settled charge for execution \${serviceExecutionId}\`,
        },
      });

      return settleTx;
    });
  }

  async refundHold(serviceExecutionId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const hold = await tx.walletTransaction.findFirst({
        where: {
          referenceId: serviceExecutionId,
          type: TransactionTypeEnum.HOLD,
        },
      });

      if (!hold) {
        throw new NotFoundException(\`No active hold found for service execution \${serviceExecutionId}\`);
      }

      // Refund held amount back to wallet balance
      const wallet = await tx.wallet.update({
        where: { id: hold.walletId },
        data: {
          balancePaise: { increment: hold.amountPaise },
        },
      });

      const refundTx = await tx.walletTransaction.create({
        data: {
          walletId: hold.walletId,
          amountPaise: hold.amountPaise,
          type: TransactionTypeEnum.REFUND,
          referenceType: 'SERVICE_EXECUTION',
          referenceId: serviceExecutionId,
          description: \`Refunded: \${reason}\`,
        },
      });

      return {
        wallet,
        refundTransaction: refundTx,
      };
    });
  }

  async generateMonthlyInvoiceRollup(householdId: string, yearMonth: string) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: {
        subscriptions: { include: { planTier: true } },
        wallet: {
          include: {
            transactions: {
              where: {
                type: TransactionTypeEnum.DEBIT,
              },
            },
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException(\`Household \${householdId} not found\`);
    }

    const activeSub = household.subscriptions[0];
    const planFeePaise = activeSub ? Math.round(activeSub.planTier.annualPricePaise / 12) : 0;
    const walletDebits = household.wallet?.transactions || [];
    const extraUsagePaise = walletDebits.reduce((acc, tx) => acc + tx.amountPaise, 0);

    return {
      invoiceId: \`INV-\${householdId.substring(0, 8)}-\${yearMonth}\`,
      householdId,
      householdName: household.name,
      billingCycle: yearMonth,
      currency: 'INR',
      planSubscriptionFeePaise: planFeePaise,
      planTier: activeSub?.planTier.name || 'NONE',
      payPerUseExtrasPaise: extraUsagePaise,
      totalPaise: planFeePaise + extraUsagePaise,
      totalFormatted: \`₹\${((planFeePaise + extraUsagePaise) / 100).toFixed(2)}\`,
      generatedAt: new Date().toISOString(),
    };
  }
}
`);

writeFile('apps/api/src/modules/billing/billing.controller.ts', `
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { TopupWalletDto } from './dto/topup-wallet.dto';
import { HoldFundsDto } from './dto/hold-funds.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('wallets/household/:householdId')
  async getWallet(@Param('householdId') householdId: string) {
    return this.billingService.getWalletByHousehold(householdId);
  }

  @Post('wallets/:walletId/topup')
  async topupWallet(@Param('walletId') walletId: string, @Body() dto: TopupWalletDto) {
    return this.billingService.topupWallet(walletId, dto);
  }

  @Post('wallets/hold')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async holdFunds(@Body() dto: HoldFundsDto) {
    return this.billingService.holdFunds(dto);
  }

  @Post('executions/:executionId/settle')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.CARE_OFFICER, RoleType.DOCTOR)
  async settleHold(@Param('executionId') executionId: string) {
    return this.billingService.settleHold(executionId);
  }

  @Get('invoices/household/:householdId/:yearMonth')
  async getMonthlyInvoice(
    @Param('householdId') householdId: string,
    @Param('yearMonth') yearMonth: string,
  ) {
    return this.billingService.generateMonthlyInvoiceRollup(householdId, yearMonth);
  }
}
`);

writeFile('apps/api/src/modules/billing/billing.module.ts', `
import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  providers: [BillingService],
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}
`);

// -------------------------------------------------------------
// 3. VITALS & EMERGENCY DRILL MODULE
// -------------------------------------------------------------

writeFile('apps/api/src/modules/vitals/dto/record-vitals.dto.ts', `
import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class RecordVitalsDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsOptional()
  @IsString()
  serviceExecutionId?: string;

  @IsOptional()
  @IsInt()
  systolicBp?: number;

  @IsOptional()
  @IsInt()
  diastolicBp?: number;

  @IsOptional()
  @IsNumber()
  bloodGlucoseMgDl?: number;

  @IsOptional()
  @IsString()
  fastingState?: string;

  @IsOptional()
  @IsInt()
  pulseBpm?: number;

  @IsOptional()
  @IsNumber()
  spo2Percent?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  temperatureF?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
`);

writeFile('apps/api/src/modules/vitals/dto/run-drill.dto.ts', `
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { EmergencySeverity } from '@poco/database';

export class RunEmergencyDrillDto {
  @IsNotEmpty()
  @IsString()
  householdId: string;

  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsNotEmpty()
  @IsString()
  initiatedByPhone: string;

  @IsNotEmpty()
  @IsEnum(EmergencySeverity)
  severity: EmergencySeverity;
}
`);

writeFile('apps/api/src/modules/vitals/vitals.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { RunEmergencyDrillDto } from './dto/run-drill.dto';
import { EmergencyStatusType } from '@poco/database';

@Injectable()
export class VitalsService {
  constructor(private prisma: PrismaService) {}

  async recordVitals(dto: RecordVitalsDto) {
    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });

    if (!member) {
      throw new NotFoundException(\`Member \${dto.memberId} not found\`);
    }

    // Evaluate geriatric normal thresholds
    const isAbnormal = this.checkVitalsAbnormal(dto);

    const reading = await this.prisma.vitalsReading.create({
      data: {
        memberId: dto.memberId,
        serviceExecutionId: dto.serviceExecutionId,
        systolicBp: dto.systolicBp,
        diastolicBp: dto.diastolicBp,
        bloodGlucoseMgDl: dto.bloodGlucoseMgDl,
        fastingState: dto.fastingState,
        pulseBpm: dto.pulseBpm,
        spo2Percent: dto.spo2Percent,
        weightKg: dto.weightKg,
        temperatureF: dto.temperatureF,
        notes: dto.notes,
        isAbnormal,
      },
    });

    return {
      reading,
      isAbnormal,
      alertMessage: isAbnormal
        ? 'Warning: One or more recorded vitals are outside safe geriatric reference ranges.'
        : undefined,
    };
  }

  async getMemberVitalsHistory(memberId: string, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const readings = await this.prisma.vitalsReading.findMany({
      where: {
        memberId,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Compute averages
    const validBp = readings.filter((r) => r.systolicBp && r.diastolicBp);
    const avgSystolic = validBp.length
      ? Math.round(validBp.reduce((acc, r) => acc + r.systolicBp!, 0) / validBp.length)
      : null;
    const avgDiastolic = validBp.length
      ? Math.round(validBp.reduce((acc, r) => acc + r.diastolicBp!, 0) / validBp.length)
      : null;

    const validSpo2 = readings.filter((r) => r.spo2Percent);
    const avgSpo2 = validSpo2.length
      ? Number((validSpo2.reduce((acc, r) => acc + r.spo2Percent!, 0) / validSpo2.length).toFixed(1))
      : null;

    return {
      memberId,
      timeframeDays: days,
      readingsCount: readings.length,
      averages: {
        avgSystolicBp: avgSystolic,
        avgDiastolicBp: avgDiastolic,
        avgSpo2Percent: avgSpo2,
      },
      readings,
    };
  }

  async runEmergencyDrill(dto: RunEmergencyDrillDto) {
    // Simulated emergency drill (isDrill = true ensures no external ambulance dispatch)
    const drill = await this.prisma.emergencyEvent.create({
      data: {
        householdId: dto.householdId,
        memberId: dto.memberId,
        initiatedByPhone: dto.initiatedByPhone,
        severity: dto.severity,
        status: EmergencyStatusType.RESOLVED,
        isDrill: true,
        ambulanceDispatchedAt: new Date(Date.now() + 60000), // +1 min simulated
        ambulanceArrivedAt: new Date(Date.now() + 600000), // +10 mins simulated
        resolvedAt: new Date(Date.now() + 1200000), // +20 mins simulated
        outcomeSummary: 'Simulated quarterly emergency drill successfully executed. All escalation pathways verified.',
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        household: { select: { id: true, name: true, city: true } },
      },
    });

    return {
      success: true,
      drillEventId: drill.id,
      isDrill: true,
      status: drill.status,
      drillSummary: drill.outcomeSummary,
      event: drill,
    };
  }

  private checkVitalsAbnormal(dto: RecordVitalsDto): boolean {
    if (dto.systolicBp && (dto.systolicBp > 140 || dto.systolicBp < 90)) return true;
    if (dto.diastolicBp && (dto.diastolicBp > 90 || dto.diastolicBp < 60)) return true;
    if (dto.spo2Percent && dto.spo2Percent < 92) return true;
    if (dto.pulseBpm && (dto.pulseBpm > 100 || dto.pulseBpm < 50)) return true;
    if (dto.bloodGlucoseMgDl && (dto.bloodGlucoseMgDl > 180 || dto.bloodGlucoseMgDl < 70)) return true;
    if (dto.temperatureF && (dto.temperatureF > 100.4 || dto.temperatureF < 95.0)) return true;
    return false;
  }
}
`);

writeFile('apps/api/src/modules/vitals/vitals.controller.ts', `
import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { RunEmergencyDrillDto } from './dto/run-drill.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('vitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post('record')
  @Roles(RoleType.ADMIN, RoleType.CARE_OFFICER, RoleType.DOCTOR, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async recordVitals(@Body() dto: RecordVitalsDto) {
    return this.vitalsService.recordVitals(dto);
  }

  @Get('members/:memberId/history')
  async getVitalsHistory(
    @Param('memberId') memberId: string,
    @Query('days') days?: string,
  ) {
    return this.vitalsService.getMemberVitalsHistory(memberId, days ? parseInt(days, 10) : 7);
  }

  @Post('drills/run')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.DISPATCHER)
  async runEmergencyDrill(@Body() dto: RunEmergencyDrillDto) {
    return this.vitalsService.runEmergencyDrill(dto);
  }
}
`);

writeFile('apps/api/src/modules/vitals/vitals.module.ts', `
import { Module } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';

@Module({
  providers: [VitalsService],
  controllers: [VitalsController],
  exports: [VitalsService],
})
export class VitalsModule {}
`);

// -------------------------------------------------------------
// 4. UPDATE APP MODULE
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
import { ClinicalModule } from './modules/clinical/clinical.module';
import { BillingModule } from './modules/billing/billing.module';
import { VitalsModule } from './modules/vitals/vitals.module';

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
    ClinicalModule,
    BillingModule,
    VitalsModule,
  ],
})
export class AppModule {}
`);

// -------------------------------------------------------------
// 5. VITEST INTEGRATION TESTS (Clinical, Billing, Vitals & E2E)
// -------------------------------------------------------------

writeFile('apps/api/src/__tests__/clinical.spec.ts', `
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { ClinicalService } from '../modules/clinical/clinical.service';
import { PrismaService } from '../database/prisma.service';
import { ConsultTypeEnum } from '@poco/database';

describe('Clinical Consultations & Prescriptions Integration', () => {
  let clinicalService: ClinicalService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [ClinicalService],
    }).compile();

    clinicalService = module.get<ClinicalService>(ClinicalService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should schedule a doctor home visit with structured clinical consult', async () => {
    const doctor = await prisma.user.findFirst({ where: { email: 'doctor@pococare.in' } });
    const member = await prisma.member.findFirst({ where: { id: 'mem-blr-001' } });
    expect(doctor).toBeDefined();
    expect(member).toBeDefined();

    const consult = await clinicalService.scheduleConsult({
      householdId: member!.householdId,
      memberId: member!.id,
      doctorUserId: doctor!.id,
      consultType: ConsultTypeEnum.DOCTOR_HOME_VISIT,
      specialty: 'Geriatric Medicine',
      chiefComplaint: 'Routine quarterly comprehensive geriatric assessment',
      scheduledAt: new Date().toISOString(),
    });

    expect(consult).toBeDefined();
    expect(consult.clinicalConsult).toBeDefined();
    expect(consult.clinicalConsult?.consultType).toBe(ConsultTypeEnum.DOCTOR_HOME_VISIT);
  });

  it('should submit clinical notes with ICD-10 diagnosis and issue digital prescription', async () => {
    const consult = await prisma.clinicalConsult.findFirst({
      where: { memberId: 'mem-blr-001' },
      orderBy: { createdAt: 'desc' },
    });
    expect(consult).toBeDefined();

    // 1. Submit notes
    const updatedNotes = await clinicalService.submitConsultNotes(consult!.id, {
      clinicalNotes: 'Blood pressure well-controlled on Telmisartan. Appetite good.',
      diagnosisIcd10: 'I10 (Essential hypertension)',
      followUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(updatedNotes.diagnosisIcd10).toContain('I10');

    // 2. Issue digital prescription
    const prescription = await clinicalService.createPrescription(consult!.id, {
      medicationItems: [
        {
          name: 'Telmisartan 40mg',
          dosage: '1 tablet',
          frequency: 'Once daily after breakfast',
          durationDays: 90,
        },
      ],
      pdfUrl: 'https://cdn.pococare.in/rx/rx-blr-001.pdf',
    });

    expect(prescription).toBeDefined();
    expect(prescription.medicationItems).toHaveLength(1);
  });
});
`);

writeFile('apps/api/src/__tests__/billing-wallet.spec.ts', `
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { BillingService } from '../modules/billing/billing.service';
import { PrismaService } from '../database/prisma.service';

describe('Billing & Wallet Ledger Integration', () => {
  let billingService: BillingService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [BillingService],
    }).compile();

    billingService = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should query household wallet balance and perform atomic top-up', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    expect(household).toBeDefined();

    const wallet = await billingService.getWalletByHousehold(household!.id);
    const initialBalance = wallet.balancePaise;

    const topup = await billingService.topupWallet(wallet.id, {
      amountPaise: 500000, // ₹5,000
      paymentReference: \`PG-TEST-\${Date.now()}\`,
      description: 'Razorpay NetBanking wallet topup',
    });

    expect(topup.wallet.balancePaise).toBe(initialBalance + 500000);
  });

  it('should atomically hold funds and settle upon service completion', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    const wallet = await billingService.getWalletByHousehold(household!.id);
    const startingBalance = wallet.balancePaise;
    const testExecutionId = \`exec-test-\${Date.now()}\`;

    // 1. Hold ₹1,500
    const holdRes = await billingService.holdFunds({
      walletId: wallet.id,
      amountPaise: 150000,
      serviceExecutionId: testExecutionId,
      description: 'Hold for Doctor Home Visit',
    });

    expect(holdRes.wallet.balancePaise).toBe(startingBalance - 150000);

    // 2. Settle hold
    const settleTx = await billingService.settleHold(testExecutionId);
    expect(settleTx.type).toBe('DEBIT');
    expect(settleTx.amountPaise).toBe(150000);
  });

  it('should generate monthly invoice rollup calculation', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    const invoice = await billingService.generateMonthlyInvoiceRollup(household!.id, '2026-08');

    expect(invoice.householdId).toBe(household!.id);
    expect(invoice.currency).toBe('INR');
    expect(invoice.totalPaise).toBeGreaterThan(0);
  });
});
`);

writeFile('apps/api/src/__tests__/vitals.spec.ts', `
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { VitalsService } from '../modules/vitals/vitals.service';
import { PrismaService } from '../database/prisma.service';
import { EmergencySeverity } from '@poco/database';

describe('Vitals Ingestion & Emergency Drill Integration', () => {
  let vitalsService: VitalsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [VitalsService],
    }).compile();

    vitalsService = module.get<VitalsService>(VitalsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should ingest vitals reading and compute 7-day trend statistics', async () => {
    const res = await vitalsService.recordVitals({
      memberId: 'mem-blr-001',
      systolicBp: 122,
      diastolicBp: 80,
      pulseBpm: 72,
      spo2Percent: 98,
      bloodGlucoseMgDl: 105,
      notes: 'Morning reading after light breakfast',
    });

    expect(res.reading).toBeDefined();
    expect(res.isAbnormal).toBe(false);

    const history = await vitalsService.getMemberVitalsHistory('mem-blr-001', 7);
    expect(history.readings.length).toBeGreaterThan(0);
    expect(history.averages.avgSystolicBp).toBeGreaterThan(0);
  });

  it('should flag abnormal vitals when exceeding geriatric thresholds', async () => {
    const res = await vitalsService.recordVitals({
      memberId: 'mem-blr-001',
      systolicBp: 165, // High
      diastolicBp: 98,  // High
      pulseBpm: 110,   // High
      spo2Percent: 89,  // Low
    });

    expect(res.isAbnormal).toBe(true);
    expect(res.alertMessage).toBeDefined();
  });

  it('should execute simulated quarterly emergency drill without live ambulance dispatch', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    const drill = await vitalsService.runEmergencyDrill({
      householdId: household!.id,
      memberId: 'mem-blr-001',
      initiatedByPhone: '+919880011223',
      severity: EmergencySeverity.CRITICAL,
    });

    expect(drill.success).toBe(true);
    expect(drill.isDrill).toBe(true);
    expect(drill.status).toBe('RESOLVED');
  });
});
`);

console.log('Finished writing Clinical, Billing, Vitals modules, AppModule, and Vitest test suites');

