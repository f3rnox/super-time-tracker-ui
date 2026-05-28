import { type TimeSheet } from "@/lib/types";

/**
 * Returns the next unused entry id for a sheet.
 */
export function get_next_entry_id(sheet: TimeSheet): number {
  if (sheet.entries.length === 0) {
    return 0;
  }

  return Math.max(...sheet.entries.map((entry) => entry.id)) + 1;
}
