import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Stable key for a running entry across tracker state updates.
 */
export function get_running_entry_key(entry: SerializedEntry): string {
  return `${entry.sheetName}:${entry.id}`;
}
