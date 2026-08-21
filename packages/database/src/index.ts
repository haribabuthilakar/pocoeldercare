import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';
export {
  PrismaClient,
  RoleType,
  PlanTierName,
  ServiceCategoryName,
  ExecutionStatusType,
  EmergencySeverity,
  EmergencyStatusType,
  TransactionTypeEnum,
  ConsultTypeEnum,
  AbhaSyncStatus,
} from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

