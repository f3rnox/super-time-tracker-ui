import { pick_merged_active_entry_both_ended } from "@/lib/pick_merged_active_entry_both_ended";
import { pick_merged_active_entry_both_running } from "@/lib/pick_merged_active_entry_both_running";
import { pick_merged_active_entry_one_running } from "@/lib/pick_merged_active_entry_one_running";
import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Picks the active entry id when both base and incoming entries exist.
 */
export function pick_merged_active_entry_id_when_both(
  base_entry: TimeSheetEntry,
  incoming_entry: TimeSheetEntry,
  entries: TimeSheetEntry[],
  prefer: MergePreference,
): number | null {
  const one_running = pick_merged_active_entry_one_running(
    base_entry,
    incoming_entry,
    prefer,
  );

  if (one_running !== undefined) {
    return one_running;
  }

  if (base_entry.end === null && incoming_entry.end === null) {
    return pick_merged_active_entry_both_running(
      base_entry,
      incoming_entry,
      entries,
      prefer,
    );
  }

  return pick_merged_active_entry_both_ended(
    base_entry,
    incoming_entry,
    entries,
    prefer,
  );
}
