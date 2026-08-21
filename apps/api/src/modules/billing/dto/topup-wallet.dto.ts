import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

export class TopupWalletDto {
  @IsNotEmpty()
  @IsInt()
  @Min(10000, { message: 'Minimum top-up is ₹100 (10,000 paise)' })
  amountPaise: number;

  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
