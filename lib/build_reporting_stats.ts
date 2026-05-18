import { get_average_entry_ms } from '@/lib/get_average_entry_ms'
import { type PeriodRangeMs } from '@/lib/get_period_range_ms'
import { get_reporting_period_totals } from '@/lib/get_reporting_period_totals'
import { get_sheet_report_stats } from '@/lib/get_sheet_report_stats'
import { get_sheet_report_stats_for_range } from '@/lib/get_sheet_report_stats_for_range'
import { partition_sheet_report_stats } from '@/lib/partition_sheet_report_stats'
import { type ReportingStats } from '@/lib/types/reporting'
import { type TimeSheet } from '@/lib/types'

/**
 * Builds a full reporting snapshot, optionally clipped to a date range.
 */
export function build_reporting_stats(
  sheets: TimeSheet[],
  range: PeriodRangeMs | null = null,
  now: number = Date.now(),
  week_starts_on: 0 | 1 = 1,
): ReportingStats {
  const sheet_stats = sheets.map((sheet) =>
    range === null
      ? get_sheet_report_stats(sheet)
      : get_sheet_report_stats_for_range(
          sheet,
          range.startMs,
          range.endMs,
          now,
        ),
  )
  const { activeSheets, idleSheets } = partition_sheet_report_stats(sheet_stats)
  const grand_total_ms = sheet_stats.reduce(
    (total, sheet) => total + sheet.totalMs,
    0,
  )
  const total_entry_count = sheet_stats.reduce(
    (total, sheet) => total + sheet.entryCount,
    0,
  )

  return {
    activeSheets,
    idleSheets,
    grandTotalMs: grand_total_ms,
    totalEntryCount: total_entry_count,
    grandAverageEntryMs: get_average_entry_ms(grand_total_ms, total_entry_count),
    periodTotals:
      range === null
        ? get_reporting_period_totals(
            sheets,
            new Date(now),
            now,
            week_starts_on,
          )
        : { todayMs: 0, weekMs: 0, monthMs: 0 },
  }
}
