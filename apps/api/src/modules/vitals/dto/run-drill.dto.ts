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
