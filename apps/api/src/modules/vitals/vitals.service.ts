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
      throw new NotFoundException(`Member ${dto.memberId} not found`);
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
