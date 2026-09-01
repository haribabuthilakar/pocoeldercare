# Phase 03: Common NestJS Backend & Business Services - Pattern Map

**Mapped:** 2026-09-01
**Files analyzed:** 18 new/modified backend modules, services, controllers, and workers
**Analogs found:** 14 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/api/src/modules/auth/auth.controller.ts` | controller | request-response | `apps/api/src/modules/webhooks/webhooks.controller.ts` | role-match |
| `apps/api/src/modules/auth/auth.service.ts` | service | CRUD / Auth | `apps/api/src/modules/webhooks/webhooks.service.ts` | role-match |
| `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` | guard | request-response | `apps/api/src/modules/webhooks/guards/webhook-hmac.guard.ts` | exact |
| `apps/api/src/modules/auth/guards/household-context.guard.ts` | guard | request-response | `apps/api/src/modules/webhooks/guards/webhook-hmac.guard.ts` | exact |
| `apps/api/src/modules/households/households.service.ts` | service | CRUD | `packages/integrations/src/adapters/base.adapter.ts` | role-match |
| `apps/api/src/modules/care-officers/care-officers.service.ts` | service | CRUD / State | `packages/business-rules/src/assignments/validator.ts` | exact |
| `apps/api/src/modules/catalog/catalog.service.ts` | service | CRUD / Versioning | `packages/business-rules/src/catalog/pricing.ts` | role-match |
| `apps/api/src/modules/tickets/tickets.service.ts` | service | State Machine | `packages/business-rules/src/state-machine/ticket.ts` | exact |
| `apps/api/src/modules/tickets/service-requests.service.ts` | service | State Machine | `packages/business-rules/src/state-machine/service-request.ts` | exact |
| `apps/api/src/modules/billing/billing.service.ts` | service | Transactional / Ledger | `packages/business-rules/src/billing/evaluator.ts` | exact |
| `apps/api/src/modules/activity-feed/activity-feed.service.ts` | service | Event / Polling | `apps/api/src/modules/webhooks/webhooks.service.ts` | role-match |
| `apps/api/src/modules/ai-triage/ai-triage.service.ts` | service | Event / LLM | `packages/integrations/src/adapters/base.adapter.ts` | role-match |
| `apps/api/src/modules/ai-triage/providers/mock.provider.ts` | provider | Request-Response | `packages/integrations/src/adapters/base.adapter.ts` | exact |
| `apps/api/src/modules/jobs/jobs.service.ts` | service / worker | In-Process Queue | `apps/api/src/modules/jobs/wearable-ping-scanner.job.ts` | exact |
| `apps/api/src/modules/jobs/workers/sla-transition.worker.ts` | worker | Scheduled Cron / Batch | `apps/api/src/modules/jobs/wearable-ping-scanner.job.ts` | exact |
| `apps/api/src/modules/media/media.service.ts` | service | Presigned URL / I/O | `apps/api/src/modules/webhooks/webhooks.service.ts` | role-match |
| `apps/api/src/modules/media/local-disk.controller.ts` | controller | File I/O (Dev) | `apps/api/src/modules/webhooks/webhooks.controller.ts` | role-match |
| `apps/api/vitest.config.ts` | config | Test Runner | `packages/integrations/vitest.config.ts` | exact |

## Pattern Assignments

### `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` (guard, request-response)

**Analog:** `apps/api/src/modules/webhooks/guards/webhook-hmac.guard.ts`

**Imports Pattern:**
```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
```

**Guard Implementation Pattern:**
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.substring(7);
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

---

### `apps/api/src/modules/jobs/workers/sla-transition.worker.ts` (worker, scheduled cron)

**Analog:** `apps/api/src/modules/jobs/wearable-ping-scanner.job.ts`

**Scheduled Job Pattern:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@poco/database';
import { evaluateSlaStatus } from '@poco/business-rules';

@Injectable()
export class SlaTransitionWorker {
  private readonly logger = new Logger(SlaTransitionWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluateActiveSlas(): Promise<void> {
    const activeTickets = await this.prisma.ticket.findMany({
      where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_OPS_UPDATE'] } },
      take: 50,
      include: { assignedCareOfficer: true },
    });

    const now = new Date();
    for (const ticket of activeTickets) {
      const slaResult = evaluateSlaStatus({
        responseDueAt: ticket.responseDueAt,
        deliveryDueAt: ticket.deliveryDueAt,
        now,
      });

      if (slaResult.status !== ticket.slaStatus) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { slaStatus: slaResult.status },
        });

        if (slaResult.status === 'BREACHED') {
          // Automatic Senior Care Officer Fallback Escalation (CARE-05, SLA-04)
          await this.escalateToSupervisor(ticket);
        }
      }
    }
  }
}
```

---

## Shared Patterns

### Business Rule Execution in Services
**Source:** `@poco/business-rules`
**Apply to:** `TicketService`, `BillingService`, `CareOfficerService`
```typescript
// Pure function execution inside transactional boundaries
const decision = evaluateBillingAction({ ...params });
if (decision.action === BillingActionType.DEBIT_WALLET) {
  // apply DB mutation
}
```

### Zod Schema Request Validation
**Source:** `@poco/validation`
**Apply to:** All surface controllers (`/api/family/v1`, `/api/field/v1`, `/api/admin/v1`)
```typescript
// Pipe-level or service-level Zod parsing
const validated = createTicketSchema.parse(body);
```

## Metadata

**Analog search scope:** `apps/api/src`, `packages/business-rules/src`, `packages/integrations/src`, `packages/validation/src`
**Files scanned:** 35
**Pattern extraction date:** 2026-09-01
