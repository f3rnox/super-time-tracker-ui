import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns whether an entry is archived (hidden from entry lists).
 */
export function is_entry_archived(
  entry: Pick<TimeSheetEntry, "archived">,
): boolean {
  return entry.archived === true;
}
