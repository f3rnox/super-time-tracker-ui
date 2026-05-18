import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Returns a stable row key for an entry in list UIs.
 */
export function get_entry_row_key(entry: SerializedEntry): string {
  return `${entry.sheetName}-${entry.id}`;
}
