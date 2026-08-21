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
      throw new NotFoundException(`Service catalog item ${serviceCode} not found`);
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
      throw new NotFoundException(`Clinical consult ${consultId} not found`);
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
      throw new NotFoundException(`Clinical consult ${consultId} not found`);
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
      throw new NotFoundException(`Consult ${consultId} not found`);
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
