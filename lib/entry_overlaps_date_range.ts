import { type TimeSheetEntry } from "@/lib/types";
import { type PeriodRangeMs } from "@/lib/get_period_range_ms";

/**
 * Returns whether an entry overlaps an inclusive date range.
 */
export function entry_overlaps_date_range(
  entry: TimeSheetEntry,
  range: PeriodRangeMs,
  reference_now_ms: number = Date.now(),
): boolean {
  const entry_start_ms = entry.start.getTime();
  const entry_end_ms =
    entry.end === null ? reference_now_ms : entry.end.getTime();

  return entry_start_ms <= range.endMs && entry_end_ms >= range.startMs;
}
