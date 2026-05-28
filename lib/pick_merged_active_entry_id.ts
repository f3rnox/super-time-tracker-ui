import { find_sheet_entry_by_active_id } from "@/lib/find_sheet_entry_by_active_id";
import { normalize_active_entry_id } from "@/lib/normalize_active_entry_id";
import { pick_merged_active_entry_id_when_both } from "@/lib/pick_merged_active_entry_id_when_both";
import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Picks which active entry id to keep when merging two sheets.
 */
export function pick_merged_active_entry_id(
  base_active_id: number | null,
  incoming_active_id: number | null,
  entries: TimeSheetEntry[],
  prefer: MergePreference,
): number | null {
  const base_entry = find_sheet_entry_by_active_id(base_active_id, entries);
  const incoming_entry = find_sheet_entry_by_active_id(
    incoming_active_id,
    entries,
  );

  if (base_entry === null && incoming_entry === null) {
    return null;
  }

  if (base_entry === null) {
    return normalize_active_entry_id(incoming_entry!.id, entries);
  }

  if (incoming_entry === null) {
    return normalize_active_entry_id(base_entry.id, entries);
  }

  return pick_merged_active_entry_id_when_both(
    base_entry,
    incoming_entry,
    entries,
    prefer,
  );
}
