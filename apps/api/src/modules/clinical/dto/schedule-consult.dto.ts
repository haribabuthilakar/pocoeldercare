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
