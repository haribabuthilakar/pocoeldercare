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
