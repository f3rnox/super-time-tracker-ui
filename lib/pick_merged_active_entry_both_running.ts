import { normalize_active_entry_id } from "@/lib/normalize_active_entry_id";
import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Picks the active entry id when both merged entries are still running.
 */
export function pick_merged_active_entry_both_running(
  base_entry: TimeSheetEntry,
  incoming_entry: TimeSheetEntry,
  entries: TimeSheetEntry[],
  prefer: MergePreference,
): number | null {
  if (base_entry.start.getTime() === incoming_entry.start.getTime()) {
    return normalize_active_entry_id(
      prefer === "incoming" ? incoming_entry.id : base_entry.id,
      entries,
    );
  }

  return normalize_active_entry_id(
    base_entry.start.getTime() > incoming_entry.start.getTime()
      ? base_entry.id
      : incoming_entry.id,
    entries,
  );
}
