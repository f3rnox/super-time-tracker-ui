import { get_period_range_ms } from '@/lib/get_period_range_ms'
import { get_sheets_duration_in_range } from '@/lib/get_sheets_duration_in_range'
import { type ReportingPeriodTotals } from '@/lib/types/reporting'
import { type TimeSheet } from '@/lib/types'

/**
 * Builds today, week, and month totals with duration clipped to each period.
 */
export function get_reporting_period_totals(
  sheets: TimeSheet[],
  reference: Date = new Date(),
  now: number = Date.now(),
  week_starts_on: 0 | 1 = 1,
): ReportingPeriodTotals {
  const today_range = get_period_range_ms('today', reference, week_starts_on)
  const week_range = get_period_range_ms('week', reference, week_starts_on)
  const month_range = get_period_range_ms('month', reference, week_starts_on)

  return {
    todayMs: get_sheets_duration_in_range(
      sheets,
      today_range.startMs,
      today_range.endMs,
      now,
    ),
    weekMs: get_sheets_duration_in_range(
      sheets,
      week_range.startMs,
      week_range.endMs,
      now,
    ),
    monthMs: get_sheets_duration_in_range(
      sheets,
      month_range.startMs,
      month_range.endMs,
      now,
    ),
  }
}
