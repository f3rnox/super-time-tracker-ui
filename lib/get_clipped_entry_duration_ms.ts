import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns entry duration in milliseconds clipped to an inclusive time range.
 */
export function get_clipped_entry_duration_ms(
  entry: TimeSheetEntry,
  range_start_ms: number,
  range_end_ms: number,
  now: number = Date.now(),
): number {
  const entry_start_ms = +entry.start;
  const entry_end_ms = entry.end === null ? now : +entry.end;
  const clipped_start_ms = Math.max(entry_start_ms, range_start_ms);
  const clipped_end_ms = Math.min(entry_end_ms, range_end_ms);

  return Math.max(0, clipped_end_ms - clipped_start_ms);
}
