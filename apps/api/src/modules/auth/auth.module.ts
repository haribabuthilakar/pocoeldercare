import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FieldAuthGuard } from '../../common/guards/field-auth.guard';
import { HouseholdContextGuard } from '../../common/guards/household-context.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'poco-elder-care-super-secret-jwt-key-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    FieldAuthGuard,
    HouseholdContextGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    FieldAuthGuard,
    HouseholdContextGuard,
    JwtModule,
  ],
})
export class AuthModule {}
