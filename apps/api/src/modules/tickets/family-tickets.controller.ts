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
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdContextGuard } from '../../common/guards/household-context.guard';
import { CurrentHousehold } from '../../common/decorators/current-household.decorator';
import { TicketPriority } from '@poco/constants';
import { PrismaService } from '../../common/prisma/prisma.module';

@Controller('family/v1/tickets')
@UseGuards(JwtAuthGuard, HouseholdContextGuard)
export class FamilyTicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getHouseholdTickets(@CurrentHousehold() household: any) {
    return this.ticketsService.getAdminTickets({ householdId: household.householdId });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFamilyTicket(
    @CurrentHousehold() household: any,
    @Body()
    body: {
      title: string;
      description: string;
      category?: string;
      priority?: TicketPriority;
      seniorId?: string;
    },
  ) {
    return this.ticketsService.createTicket({
      householdId: household.householdId,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority || TicketPriority.ROUTINE,
      seniorId: body.seniorId,
    });
  }

  @Get('escalation-tree')
  async getEscalationTree(@CurrentHousehold() household: any) {
    return this.prisma.familyEscalationTier.findMany({
      where: { householdId: household.householdId },
      include: { person: true },
      orderBy: { tierOrder: 'asc' },
    });
  }
}
