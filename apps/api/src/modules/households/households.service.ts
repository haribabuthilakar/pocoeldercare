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
      throw new NotFoundException(`Household ${id} not found`);
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
      throw new NotFoundException(`Household ${householdId} not found`);
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
    const cacheKey = `ice:${memberId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.warn(`Failed to parse cached ICE JSON: ${e}`);
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
      throw new NotFoundException(`ICE Profile for member ${memberId} not found`);
    }

    const response = {
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
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
      throw new NotFoundException(`Member ${memberId} not found`);
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
    const cacheKey = `ice:${memberId}`;
    await this.redisService.set(cacheKey, JSON.stringify(data), 3600);
  }
}
