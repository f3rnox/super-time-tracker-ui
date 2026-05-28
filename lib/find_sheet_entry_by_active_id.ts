import { type TimeSheetEntry } from "@/lib/types";

/**
 * Finds a sheet entry by its active id, or null when the id is missing.
 */
export function find_sheet_entry_by_active_id(
  active_id: number | null,
  entries: TimeSheetEntry[],
): TimeSheetEntry | null {
  if (active_id === null) {
    return null;
  }

  return entries.find((entry) => entry.id === active_id) ?? null;
}
