import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class EvaluateChecklistDto {
  @IsNotEmpty()
  @IsString()
  sopTemplateId: string;

  @IsNotEmpty()
  @IsObject()
  completedSteps: Record<string, any>;
}
