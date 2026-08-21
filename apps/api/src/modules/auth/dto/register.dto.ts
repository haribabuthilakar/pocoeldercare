import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum, Matches } from 'class-validator';
import { RoleType } from '@poco/database';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone must be a valid E.164 phone number' })
  phone?: string;

  @IsOptional()
  @IsEnum(RoleType)
  initialRole?: RoleType;
}
