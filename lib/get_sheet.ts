import { type TimeSheet, type TimeTrackerDB } from "@/lib/types";

/**
 * Returns a sheet by name or throws when it does not exist.
 */
export function get_sheet(db: TimeTrackerDB, sheet_name: string): TimeSheet {
  const sheet = db.sheets.find(({ name }) => name === sheet_name);

  if (sheet === undefined) {
    throw new Error(`Sheet ${sheet_name} not found`);
  }

  return sheet;
}
