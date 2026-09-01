import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { FamilyRole } from '@poco/constants';

@Injectable()
export class HouseholdsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserHouseholds(personId: string) {
    const memberships = await this.prisma.householdMembership.findMany({
      where: { personId },
      include: {
        household: {
          include: {
            seniors: true,
            assignedCareOfficer: {
              include: { internalUser: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      householdId: m.householdId,
      role: m.role,
      isPrimaryContact: m.isPrimaryContact,
      household: {
        id: m.household.id,
        name: m.household.name,
        address: `${m.household.addressLine1}, ${m.household.city}`,
        seniorCount: m.household.seniors.length,
        seniors: m.household.seniors,
        assignedCareOfficer: m.household.assignedCareOfficer
          ? {
              id: m.household.assignedCareOfficer.id,
              name: m.household.assignedCareOfficer.internalUser.name,
              phone: m.household.assignedCareOfficer.phone,
            }
          : null,
      },
    }));
  }

  async getHouseholdProfile(householdId: string) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: {
        memberships: {
          include: { person: true },
        },
        seniors: {
          include: {
            medicalProfile: true,
          },
        },
        assignedCareOfficer: {
          include: { internalUser: true },
        },
        wallet: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { packageVersion: true },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    return household;
  }

  async inviteCaregiver(
    householdId: string,
    callerPersonId: string,
    data: { name: string; phone: string; email?: string; role?: FamilyRole },
  ) {
    // Verify caller is primary contact or caregiver
    const callerMembership = await this.prisma.householdMembership.findUnique({
      where: {
        personId_householdId: {
          personId: callerPersonId,
          householdId,
        },
      },
    });

    if (!callerMembership || !callerMembership.isPrimaryContact) {
      throw new ForbiddenException('Only primary family contacts can invite new members');
    }

    // Find or create person
    let person = await this.prisma.person.findUnique({
      where: { phone: data.phone },
    });

    if (!person) {
      person = await this.prisma.person.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
      });
    }

    // Check if membership already exists
    const existing = await this.prisma.householdMembership.findUnique({
      where: {
        personId_householdId: {
          personId: person.id,
          householdId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Person is already a member of this household');
    }

    const membership = await this.prisma.householdMembership.create({
      data: {
        personId: person.id,
        householdId,
        role: data.role || FamilyRole.SECONDARY_CAREGIVER,
        isPrimaryContact: false,
      },
      include: { person: true },
    });

    return membership;
  }

  async removeCaregiver(
    householdId: string,
    callerPersonId: string,
    targetPersonId: string,
  ) {
    const callerMembership = await this.prisma.householdMembership.findUnique({
      where: {
        personId_householdId: {
          personId: callerPersonId,
          householdId,
        },
      },
    });

    if (!callerMembership || !callerMembership.isPrimaryContact) {
      throw new ForbiddenException('Only primary family contacts can remove members');
    }

    if (callerPersonId === targetPersonId) {
      throw new BadRequestException('Primary contact cannot remove themselves from household');
    }

    await this.prisma.householdMembership.delete({
      where: {
        personId_householdId: {
          personId: targetPersonId,
          householdId,
        },
      },
    });

    return { success: true, message: 'Caregiver removed from household' };
  }
}
