import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { type TimeSheet, type TimeTrackerDB } from "@/lib/types";

/**
 * Returns the sheet that has a running entry, if one exists.
 */
export function find_sheet_with_active_entry(
  db: TimeTrackerDB,
): TimeSheet | null {
  for (const sheet of db.sheets) {
    if (find_running_entry_on_sheet(sheet) !== null) {
      return sheet;
    }
  }

  return null;
}
