import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SopStepDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  type: string; // 'BOOLEAN' | 'NUMBER' | 'PHOTO_URL' | 'VITALS' | 'SIGNATURE' | 'TEXT'

  @IsNotEmpty()
  required: boolean;
}

export class CreateSopTemplateDto {
  @IsNotEmpty()
  @IsString()
  serviceCatalogId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SopStepDto)
  steps: SopStepDto[];
}
