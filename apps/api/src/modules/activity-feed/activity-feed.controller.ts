import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivityFeedService } from './activity-feed.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdContextGuard } from '../../common/guards/household-context.guard';
import { CurrentHousehold } from '../../common/decorators/current-household.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('family/v1/feed')
@UseGuards(JwtAuthGuard, HouseholdContextGuard)
export class ActivityFeedController {
  constructor(private readonly feedService: ActivityFeedService) {}

  @Get()
  async getFeed(
    @CurrentHousehold() household: any,
    @Query('since') sinceStr?: string,
  ) {
    const since = sinceStr ? new Date(sinceStr) : undefined;
    return this.feedService.getHouseholdFeed(household.householdId, since);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async postMessage(
    @CurrentHousehold() household: any,
    @CurrentUser() user: any,
    @Body() body: { content: string; mediaUrls?: string[] },
  ) {
    return this.feedService.postFeedItem({
      householdId: household.householdId,
      eventType: 'CHAT_MESSAGE',
      authorPersonId: user.sub,
      content: body.content,
      mediaUrls: body.mediaUrls,
    });
  }
}
