import { type TimeSheetEntry } from "@/lib/types";

export interface FocusNudgesEntryAggregates {
  last_log_ms: number | null;
  active_timer_duration_ms: number | null;
}

/**
 * Updates last-log and longest-running-timer aggregates for one entry.
 */
export function update_focus_nudges_entry_aggregates(
  entry: TimeSheetEntry,
  now_ms: number,
  previous: FocusNudgesEntryAggregates,
): FocusNudgesEntryAggregates {
  const entry_start_ms = +entry.start;
  const entry_end_ms = entry.end === null ? null : +entry.end;
  const entry_last_log_ms =
    entry_end_ms === null
      ? entry_start_ms
      : Math.max(entry_start_ms, entry_end_ms);

  const last_log_ms =
    previous.last_log_ms === null || entry_last_log_ms > previous.last_log_ms
      ? entry_last_log_ms
      : previous.last_log_ms;

  if (entry.end !== null) {
    return {
      last_log_ms,
      active_timer_duration_ms: previous.active_timer_duration_ms,
    };
  }

  const duration_ms = Math.max(0, now_ms - entry_start_ms);
  const active_timer_duration_ms =
    previous.active_timer_duration_ms === null ||
    duration_ms > previous.active_timer_duration_ms
      ? duration_ms
      : previous.active_timer_duration_ms;

  return { last_log_ms, active_timer_duration_ms };
}
