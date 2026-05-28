import { type TimeSheetEntry, type TimeTrackerDB } from "@/lib/types";

interface LastCompletedEntryResult {
  sheetName: string;
  entry: TimeSheetEntry;
}

/**
 * Returns the most recently completed entry across all sheets.
 */
export function find_last_completed_entry(
  db: TimeTrackerDB,
): LastCompletedEntryResult | null {
  let best: LastCompletedEntryResult | null = null;
  let best_end_ms = -1;

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      if (entry.end === null) {
        continue;
      }

      const end_ms = entry.end.getTime();

      if (end_ms > best_end_ms) {
        best_end_ms = end_ms;
        best = { sheetName: sheet.name, entry };
      }
    }
  }

  return best;
}
