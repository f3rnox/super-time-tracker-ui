import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Returns whether two completed entries can merge (first ends when second starts).
 */
export function entries_are_mergeable(
  earlier: SerializedEntry,
  later: SerializedEntry,
): boolean {
  if (earlier.sheetName !== later.sheetName) {
    return false;
  }

  if (earlier.isActive || later.isActive) {
    return false;
  }

  if (earlier.end === null || later.end === null) {
    return false;
  }

  return new Date(earlier.end).getTime() === new Date(later.start).getTime();
}
