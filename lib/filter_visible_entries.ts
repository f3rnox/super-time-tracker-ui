import { is_entry_archived } from "@/lib/is_entry_archived";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns entries that are not archived.
 */
export function filter_visible_entries(
  entries: TimeSheetEntry[],
): TimeSheetEntry[] {
  return entries.filter((entry) => !is_entry_archived(entry));
}
