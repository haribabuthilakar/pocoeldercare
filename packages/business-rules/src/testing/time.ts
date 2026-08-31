import { addMinutes, addHours, addDays, subMinutes, subHours, subDays } from 'date-fns';

export const BASE_TEST_TIME = new Date('2026-06-01T10:00:00.000Z');

export function timeAfter(
  duration: { minutes?: number; hours?: number; days?: number },
  from: Date = BASE_TEST_TIME
): Date {
  let result = new Date(from);
  if (duration.days) result = addDays(result, duration.days);
  if (duration.hours) result = addHours(result, duration.hours);
  if (duration.minutes) result = addMinutes(result, duration.minutes);
  return result;
}

export function timeBefore(
  duration: { minutes?: number; hours?: number; days?: number },
  from: Date = BASE_TEST_TIME
): Date {
  let result = new Date(from);
  if (duration.days) result = subDays(result, duration.days);
  if (duration.hours) result = subHours(result, duration.hours);
  if (duration.minutes) result = subMinutes(result, duration.minutes);
  return result;
}
