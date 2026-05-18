import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns entry duration in milliseconds, using now when still active.
 */
export function get_entry_duration_ms(
  entry: TimeSheetEntry,
  now: number = Date.now(),
): number {
  const { end, start } = entry;
  const effective_end = end === null ? now : +end;

  return Math.max(0, effective_end - +start);
}
