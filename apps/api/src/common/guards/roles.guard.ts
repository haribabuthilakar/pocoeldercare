import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@poco/constants';
import { hasCapability, hasAnyCapability } from '@poco/business-rules';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || user.tokenType !== 'INTERNAL' || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Access denied: insufficient internal privileges');
    }

    // Check if user has any of the required roles directly, or if SuperAdmin
    const hasRole = user.roles.includes(UserRole.SUPER_ADMIN) ||
      requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Access denied: missing required role');
    }

    return true;
  }
}
