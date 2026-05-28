import { type TimeSheet, type TimeSheetEntry } from "@/lib/types";

/**
 * Returns the running entry on a sheet, if activeEntryID points to one.
 */
export function find_running_entry_on_sheet(
  sheet: TimeSheet,
): TimeSheetEntry | null {
  if (sheet.activeEntryID === null) {
    return null;
  }

  const entry = sheet.entries.find(({ id }) => id === sheet.activeEntryID);

  if (entry?.end != null) {
    return null;
  }

  return entry ?? null;
}
