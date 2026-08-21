import { IsNotEmpty, IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class SubmitConsultNotesDto {
  @IsNotEmpty()
  @IsString()
  clinicalNotes: string;

  @IsOptional()
  @IsString()
  diagnosisIcd10?: string;

  @IsOptional()
  @IsObject()
  vitalsSummary?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
