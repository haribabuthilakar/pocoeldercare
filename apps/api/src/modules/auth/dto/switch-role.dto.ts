import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleType } from '@poco/database';

export class SwitchRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleType)
  targetRole: RoleType;

  @IsOptional()
  @IsString()
  householdId?: string;
}
