import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

export class HoldFundsDto {
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  amountPaise: number;

  @IsNotEmpty()
  @IsString()
  serviceExecutionId: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
