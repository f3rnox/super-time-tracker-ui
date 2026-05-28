import { get_average_entry_ms } from "@/lib/get_average_entry_ms";
import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { type SheetReportStats } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

/**
 * Builds per-sheet aggregates with durations clipped to a date range.
 */
export function get_sheet_report_stats_for_range(
  sheet: TimeSheet,
  range_start_ms: number,
  range_end_ms: number,
  now: number = Date.now(),
): SheetReportStats {
  let total_ms = 0;
  let entry_count = 0;
  let has_active_entry = false;

  for (const entry of sheet.entries) {
    const clipped_ms = get_clipped_entry_duration_ms(
      entry,
      range_start_ms,
      range_end_ms,
      now,
    );

    if (clipped_ms <= 0) {
      continue;
    }

    total_ms += clipped_ms;
    entry_count += 1;

    if (sheet.activeEntryID === entry.id && entry.end === null) {
      has_active_entry = true;
    }
  }

  return {
    sheetName: sheet.name,
    totalMs: total_ms,
    entryCount: entry_count,
    averageEntryMs: get_average_entry_ms(total_ms, entry_count),
    hasActiveEntry: has_active_entry,
  };
}
