import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class UpdateIceProfileDto {
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @IsOptional()
  @IsArray()
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;

  @IsOptional()
  @IsObject()
  baselineVitals?: {
    systolicBp?: number;
    diastolicBp?: number;
    pulse?: number;
    sugarFasting?: number;
  };

  @IsOptional()
  @IsString()
  preferredHospitalName?: string;

  @IsOptional()
  @IsString()
  preferredHospitalPhone?: string;

  @IsOptional()
  @IsString()
  preferredHospitalAddress?: string;

  @IsOptional()
  @IsString()
  emergencyNotes?: string;
}
