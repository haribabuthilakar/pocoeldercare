import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  externalSignUpSchema,
  externalLoginSchema,
  internalLoginSchema,
  switchHouseholdContextSchema,
  ExternalSignUpDto,
  ExternalLoginDto,
  InternalLoginDto,
  SwitchHouseholdContextDto,
} from '@poco/validation';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body(new ZodValidationPipe(externalSignUpSchema)) dto: ExternalSignUpDto,
  ) {
    return this.authService.signupExternal(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(externalLoginSchema)) dto: ExternalLoginDto,
    @Headers('x-client-type') clientType?: 'web' | 'mobile',
  ) {
    return this.authService.loginExternal(dto, clientType || 'web');
  }

  @Post('internal/login')
  @HttpCode(HttpStatus.OK)
  async internalLogin(
    @Body(new ZodValidationPipe(internalLoginSchema)) dto: InternalLoginDto,
  ) {
    return this.authService.loginInternal(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('switch-household')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async switchHousehold(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(switchHouseholdContextSchema)) dto: SwitchHouseholdContextDto,
  ) {
    return this.authService.switchHousehold(user.sub, dto.householdId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    return { user };
  }
}
