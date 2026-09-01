import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@poco/constants';

@Injectable()
export class FieldAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (
      !user ||
      user.tokenType !== 'INTERNAL' ||
      !Array.isArray(user.roles) ||
      (!user.roles.includes(UserRole.CARE_OFFICER) && !user.roles.includes(UserRole.SUPER_ADMIN))
    ) {
      throw new ForbiddenException('Field app access restricted to Care Officers');
    }
    return true;
  }
}
