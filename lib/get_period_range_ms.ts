import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export type ReportingPeriod = 'today' | 'week' | 'month'

export interface PeriodRangeMs {
  startMs: number
  endMs: number
}

/**
 * Returns inclusive millisecond bounds for a reporting calendar period.
 */
export function get_period_range_ms(
  period: ReportingPeriod,
  reference: Date = new Date(),
  week_starts_on: 0 | 1 = 1,
): PeriodRangeMs {
  switch (period) {
    case 'week':
      return {
        startMs: +startOfWeek(reference, { weekStartsOn: week_starts_on }),
        endMs: +endOfWeek(reference, { weekStartsOn: week_starts_on }),
      }
    case 'month':
      return {
        startMs: +startOfMonth(reference),
        endMs: +endOfMonth(reference),
      }
    case 'today':
    default:
      return {
        startMs: +startOfDay(reference),
        endMs: +endOfDay(reference),
      }
  }
}
