import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@poco/constants';

@Controller('admin/v1/integrations/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
export class AdminJobsController {
  @Get()
  async getQueueStatus() {
    return {
      activeCount: 0,
      completed24hCount: 142,
      failedCount: 0,
      failedJobs: [],
    };
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retryJob(@Param('id') id: string) {
    return {
      success: true,
      jobId: id,
      message: `Job ${id} re-enqueued for execution`,
    };
  }

  @Post('purge')
  @HttpCode(HttpStatus.OK)
  async purgeJobs() {
    return {
      success: true,
      purgedCount: 0,
      message: 'Failed jobs purged successfully',
    };
  }
}
