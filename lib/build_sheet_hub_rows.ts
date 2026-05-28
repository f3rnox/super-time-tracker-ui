import { get_period_range_ms } from "@/lib/get_period_range_ms";
import { get_sheet_last_activity_ms } from "@/lib/get_sheet_last_activity_ms";
import { get_sheet_report_stats_for_range } from "@/lib/get_sheet_report_stats_for_range";
import { type SheetHubRow } from "@/lib/types/sheet_hub";
import { type TimeSheet } from "@/lib/types";

/**
 * Builds per-sheet hub rows with week/month totals and last activity.
 */
export function build_sheet_hub_rows(
  sheets: TimeSheet[],
  now: number = Date.now(),
  week_starts_on: 0 | 1 = 1,
): SheetHubRow[] {
  const reference = new Date(now);
  const week_range = get_period_range_ms("week", reference, week_starts_on);
  const month_range = get_period_range_ms("month", reference);

  return sheets.map((sheet) => {
    const week_stats = get_sheet_report_stats_for_range(
      sheet,
      week_range.startMs,
      week_range.endMs,
      now,
    );
    const month_stats = get_sheet_report_stats_for_range(
      sheet,
      month_range.startMs,
      month_range.endMs,
      now,
    );
    const last_activity_ms = get_sheet_last_activity_ms(sheet, now);

    return {
      sheetName: sheet.name,
      entryCount: sheet.entries.length,
      hasActiveEntry: sheet.activeEntryID !== null,
      weekTotalMs: week_stats.totalMs,
      monthTotalMs: month_stats.totalMs,
      lastActivityAt:
        last_activity_ms === null
          ? null
          : new Date(last_activity_ms).toISOString(),
    };
  });
}
