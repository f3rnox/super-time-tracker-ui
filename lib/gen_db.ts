import { DB_VERSION, DEFAULT_SHEET_NAME } from "@/lib/config";
import {
  type TimeSheet,
  type TimeSheetEntry,
  type TimeSheetTask,
  type TimeTrackerDB,
} from "@/lib/types";

/**
 * Creates an empty sheet with optional entries and active entry.
 */
export function gen_sheet(
  name: string,
  entries: TimeSheetEntry[] = [],
  active_entry_id: number | null = null,
  tasks: TimeSheetTask[] = [],
): TimeSheet {
  if (name.length === 0) {
    throw new Error("New sheet name must not be empty");
  }

  if (
    active_entry_id !== null &&
    entries.find(({ id }) => id === active_entry_id) === undefined
  ) {
    throw new Error("New sheet active entry does not exist");
  }

  return {
    name,
    entries,
    tasks,
    activeEntryID: active_entry_id,
  };
}

/**
 * Creates a fresh time tracker database with the default sheet.
 */
export function gen_db(): TimeTrackerDB {
  return {
    version: DB_VERSION,
    sheets: [gen_sheet(DEFAULT_SHEET_NAME)],
    activeSheetName: DEFAULT_SHEET_NAME,
  };
}
