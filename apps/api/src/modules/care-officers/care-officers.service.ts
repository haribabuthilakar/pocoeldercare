import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { UserRole } from '@poco/constants';
import { validateCareOfficerAssignment } from '@poco/business-rules';

@Injectable()
export class CareOfficersService {
  constructor(private readonly prisma: PrismaService) {}

  async assignCareOfficer(
    householdId: string,
    careOfficerId: string,
    callerUser: { sub: string; roles: UserRole[] },
    requiredCertCodes: string[] = ['BLS_CPR', 'GERIATRIC_CORE'],
  ) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    const officer = await this.prisma.careOfficerProfile.findUnique({
      where: { id: careOfficerId },
      include: {
        certifications: {
          include: { certification: true },
        },
      },
    });

    if (!officer) {
      throw new NotFoundException('Care Officer profile not found');
    }

    const candidateOfficer = {
      id: officer.id,
      isAvailable: officer.isAvailable,
      certifications: officer.certifications.map((c) => ({
        certificationCode: c.certification.code,
        expiresAt: c.expiresAt,
        status: c.status as 'ACTIVE' | 'EXPIRED' | 'REVOKED',
      })),
    };

    const validationResult = validateCareOfficerAssignment(
      callerUser.roles,
      { id: household.id, assignedCareOfficerId: household.assignedCareOfficerId },
      candidateOfficer,
      requiredCertCodes,
    );

    if (!validationResult.ok) {
      throw new BadRequestException(validationResult.error.message);
    }

    // Mutate household active care officer mapping
    const updated = await this.prisma.household.update({
      where: { id: householdId },
      data: { assignedCareOfficerId: careOfficerId },
      include: {
        assignedCareOfficer: {
          include: { internalUser: true },
        },
      },
    });

    return {
      success: true,
      householdId: updated.id,
      assignedCareOfficerId: updated.assignedCareOfficerId,
      assignedCareOfficerName: updated.assignedCareOfficer?.internalUser.name,
    };
  }

  async getSupervisedOfficers(managerInternalUserId: string) {
    const managerProfile = await this.prisma.careOfficerProfile.findUnique({
      where: { internalUserId: managerInternalUserId },
      include: {
        directReports: {
          include: {
            internalUser: true,
            assignedHousehold: {
              include: { seniors: true },
            },
            certifications: {
              include: { certification: true },
            },
            assignedTickets: {
              where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_OPS_UPDATE'] } },
            },
          },
        },
      },
    });

    if (!managerProfile) {
      // If ops manager or super admin with no care officer profile, return all officers
      const allOfficers = await this.prisma.careOfficerProfile.findMany({
        include: {
          internalUser: true,
          assignedHousehold: {
            include: { seniors: true },
          },
          certifications: {
            include: { certification: true },
          },
          assignedTickets: {
            where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_OPS_UPDATE'] } },
          },
        },
      });

      return allOfficers.map((o) => ({
        id: o.id,
        name: o.internalUser.name,
        email: o.internalUser.email,
        phone: o.phone,
        isAvailable: o.isAvailable,
        clusterCode: o.clusterCode,
        assignedHousehold: o.assignedHousehold
          ? {
              id: o.assignedHousehold.id,
              name: o.assignedHousehold.name,
              seniorCount: o.assignedHousehold.seniors.length,
            }
          : null,
        activeTicketsCount: o.assignedTickets.length,
        certifications: o.certifications.map((c) => ({
          code: c.certification.code,
          name: c.certification.name,
          expiresAt: c.expiresAt,
          status: c.status,
        })),
      }));
    }

    return managerProfile.directReports.map((o) => ({
      id: o.id,
      name: o.internalUser.name,
      email: o.internalUser.email,
      phone: o.phone,
      isAvailable: o.isAvailable,
      clusterCode: o.clusterCode,
      assignedHousehold: o.assignedHousehold
        ? {
            id: o.assignedHousehold.id,
            name: o.assignedHousehold.name,
            seniorCount: o.assignedHousehold.seniors.length,
          }
        : null,
      activeTicketsCount: o.assignedTickets.length,
      certifications: o.certifications.map((c) => ({
        code: c.certification.code,
        name: c.certification.name,
        expiresAt: c.expiresAt,
        status: c.status,
      })),
    }));
  }

  async executeSupervisorFallback(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedCareOfficer: {
          include: { manager: { include: { internalUser: true } } },
        },
      },
    });

    if (!ticket || !ticket.assignedCareOfficerId) {
      throw new NotFoundException('Ticket or assigned officer not found');
    }

    const supervisor = ticket.assignedCareOfficer.manager;
    if (!supervisor) {
      throw new BadRequestException('No supervisor found in ReportingLine for fallback escalation');
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedCareOfficerId: supervisor.id,
        status: 'WAITING_OPS_UPDATE',
      },
    });

    return {
      success: true,
      ticketId: updated.id,
      escalatedToSupervisorId: supervisor.id,
      escalatedToSupervisorName: supervisor.internalUser.name,
    };
  }

  async getOfficerCertifications(careOfficerId: string) {
    const certs = await this.prisma.careOfficerCertification.findMany({
      where: { careOfficerId },
      include: { certification: true },
    });
    return certs;
  }

  async upsertOfficerCertification(
    careOfficerId: string,
    certificationCode: string,
    status: any,
    expiresAt: Date,
  ) {
    let certDef = await this.prisma.certification.findUnique({
      where: { code: certificationCode },
    });

    if (!certDef) {
      certDef = await this.prisma.certification.create({
        data: {
          code: certificationCode,
          name: certificationCode.replace(/_/g, ' '),
          validityDays: 365,
        },
      });
    }

    const officerCert = await this.prisma.careOfficerCertification.upsert({
      where: {
        careOfficerId_certificationId: {
          careOfficerId,
          certificationId: certDef.id,
        },
      },
      update: {
        status,
        expiresAt,
        updatedAt: new Date(),
      },
      create: {
        careOfficerId,
        certificationId: certDef.id,
        issuedAt: new Date(),
        expiresAt,
        status,
      },
    });

    return {
      success: true,
      officerCert,
    };
  }
}

