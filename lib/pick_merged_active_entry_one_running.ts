import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Picks the active entry id when only one side still has a running entry.
 */
export function pick_merged_active_entry_one_running(
  base_entry: TimeSheetEntry,
  incoming_entry: TimeSheetEntry,
  prefer: MergePreference,
): number | null | undefined {
  if (base_entry.end === null && incoming_entry.end !== null) {
    return prefer === "base" ? base_entry.id : null;
  }

  if (incoming_entry.end === null && base_entry.end !== null) {
    return prefer === "base" ? null : incoming_entry.id;
  }

  return undefined;
}
