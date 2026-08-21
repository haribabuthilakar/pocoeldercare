import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { TopupWalletDto } from './dto/topup-wallet.dto';
import { HoldFundsDto } from './dto/hold-funds.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('wallets/household/:householdId')
  async getWallet(@Param('householdId') householdId: string) {
    return this.billingService.getWalletByHousehold(householdId);
  }

  @Post('wallets/:walletId/topup')
  async topupWallet(@Param('walletId') walletId: string, @Body() dto: TopupWalletDto) {
    return this.billingService.topupWallet(walletId, dto);
  }

  @Post('wallets/hold')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async holdFunds(@Body() dto: HoldFundsDto) {
    return this.billingService.holdFunds(dto);
  }

  @Post('executions/:executionId/settle')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.CARE_OFFICER, RoleType.DOCTOR)
  async settleHold(@Param('executionId') executionId: string) {
    return this.billingService.settleHold(executionId);
  }

  @Get('invoices/household/:householdId/:yearMonth')
  async getMonthlyInvoice(
    @Param('householdId') householdId: string,
    @Param('yearMonth') yearMonth: string,
  ) {
    return this.billingService.generateMonthlyInvoiceRollup(householdId, yearMonth);
  }
}
