import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Counts entries across all sheets in a JSON database.
 */
export function count_json_db_entries(db: JSONTimeTrackerDB): number {
  return db.sheets.reduce((total, sheet) => total + sheet.entries.length, 0);
}
