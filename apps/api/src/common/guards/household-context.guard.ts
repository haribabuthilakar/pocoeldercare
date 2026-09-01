import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { UserRole } from '@poco/constants';

@Injectable()
export class HouseholdContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    // Extract householdId from header or query param
    const householdId =
      (request.headers['x-household-id'] as string) ||
      (request.query?.householdId as string) ||
      request.params?.householdId ||
      request.body?.householdId;

    if (!householdId) {
      throw new BadRequestException('X-Household-Id header or householdId parameter is required');
    }

    // Check if internal user with super-admin or staff privileges
    if (user.tokenType === 'INTERNAL') {
      const isStaff = user.roles.some((r: UserRole) =>
        [UserRole.SUPER_ADMIN, UserRole.OPS_MANAGER, UserRole.CARE_MANAGER, UserRole.CARE_OFFICER, UserRole.SALES_LEAD].includes(r)
      );
      if (isStaff) {
        request.household = {
          householdId,
          role: 'STAFF',
          isPrimaryContact: true,
        };
        return true;
      }
    }

    // External user: check active HouseholdMembership
    if (user.tokenType === 'EXTERNAL') {
      const membership = await this.prisma.householdMembership.findUnique({
        where: {
          personId_householdId: {
            personId: user.sub,
            householdId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('Household access unauthorized');
      }

      request.household = {
        householdId: membership.householdId,
        role: membership.role,
        isPrimaryContact: membership.isPrimaryContact,
      };
      return true;
    }

    throw new ForbiddenException('Household access unauthorized');
  }
}
