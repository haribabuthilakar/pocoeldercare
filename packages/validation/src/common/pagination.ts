import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().trim().optional()
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;

export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate']
  });

export type DateRangeDto = z.infer<typeof dateRangeSchema>;
