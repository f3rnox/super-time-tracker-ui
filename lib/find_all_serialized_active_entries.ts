import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { serialize_entry } from "@/lib/serialize_entry";
import { type SerializedEntry } from "@/lib/types/tracker_state";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Returns every running entry across all sheets, in sheet order.
 */
export function find_all_serialized_active_entries(
  db: TimeTrackerDB,
): SerializedEntry[] {
  const results: SerializedEntry[] = [];

  for (const sheet of db.sheets) {
    const entry = find_running_entry_on_sheet(sheet);

    if (entry !== null) {
      results.push(serialize_entry(entry, sheet.name, true));
    }
  }

  return results;
}
