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
