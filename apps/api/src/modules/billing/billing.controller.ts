import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdContextGuard } from '../../common/guards/household-context.guard';
import { CurrentHousehold } from '../../common/decorators/current-household.decorator';

@Controller('family/v1/billing')
@UseGuards(JwtAuthGuard, HouseholdContextGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('wallet')
  async getWallet(@CurrentHousehold() household: any) {
    return this.billingService.getHouseholdWallet(household.householdId);
  }

  @Post('top-up')
  @HttpCode(HttpStatus.OK)
  async topUp(@CurrentHousehold() household: any, @Body() body: { amountPaise: number }) {
    return this.billingService.createTopUpOrder(household.householdId, body.amountPaise);
  }

  @Get('invoices/:transactionId')
  async getInvoice(@Param('transactionId') transactionId: string) {
    return this.billingService.generateInvoice(transactionId);
  }
}
