import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@poco/constants';

@Controller('admin/v1/database')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class DatabaseController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':model')
  async getModelRecords(
    @Param('model') model: string,
    @Query('page') pageStr?: string,
    @Query('pageSize') pageSizeStr?: string,
  ) {
    const page = Math.max(1, parseInt(pageStr || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeStr || '25', 10)));
    const skip = (page - 1) * pageSize;

    const delegate = this.getModelDelegate(model);
    if (!delegate) {
      throw new NotFoundException(`Model '${model}' not supported in database explorer.`);
    }

    const [total, records] = await Promise.all([
      delegate.count(),
      delegate.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }).catch(async () => {
        return delegate.findMany({
          skip,
          take: pageSize,
        });
      }),
    ]);

    return {
      model,
      total,
      page,
      pageSize,
      records,
    };
  }

  private getModelDelegate(model: string): any {
    switch (model.toLowerCase()) {
      case 'households':
        return this.prisma.household;
      case 'seniors':
        return this.prisma.senior;
      case 'tickets':
        return this.prisma.ticket;
      case 'service-requests':
        return this.prisma.serviceRequest;
      case 'wallets':
        return this.prisma.householdWallet;
      case 'wallet-transactions':
        return this.prisma.walletTransaction;
      case 'care-officers':
        return this.prisma.careOfficerProfile;
      case 'leads':
        return this.prisma.lead;
      case 'audit-logs':
        return this.prisma.auditLog;
      default:
        return null;
    }
  }
}
