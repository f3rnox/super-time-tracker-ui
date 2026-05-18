import { get_average_entry_ms } from '@/lib/get_average_entry_ms'
import { get_serialized_entries_total_ms } from '@/lib/get_serialized_entries_total_ms'
import { serialize_sheet_entries } from '@/lib/serialize_sheet_entries'
import { type SheetReportStats } from '@/lib/types/reporting'
import { type TimeSheet } from '@/lib/types'

/**
 * Builds per-sheet time-tracking aggregates from a time sheet.
 */
export function get_sheet_report_stats(sheet: TimeSheet): SheetReportStats {
  const entries = serialize_sheet_entries(sheet)
  const entry_count = sheet.entries.length
  const total_ms = get_serialized_entries_total_ms(entries)

  return {
    sheetName: sheet.name,
    totalMs: total_ms,
    entryCount: entry_count,
    averageEntryMs: get_average_entry_ms(total_ms, entry_count),
    hasActiveEntry: sheet.activeEntryID !== null,
  }
}
