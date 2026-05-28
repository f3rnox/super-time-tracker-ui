import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Returns whether an entry can be split at an interior timestamp.
 */
export function entry_can_split(entry: SerializedEntry): boolean {
  if (entry.isActive || entry.end === null) {
    return false;
  }

  return new Date(entry.start).getTime() < new Date(entry.end).getTime();
}
