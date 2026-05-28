import { dedupe_sheet_entries_by_id } from "@/lib/dedupe_sheet_entries_by_id";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Dedupes entry ids on every sheet in the database.
 */
export function dedupe_tracker_db_sheet_entries(db: TimeTrackerDB): boolean {
  let did_change = false;

  for (const sheet of db.sheets) {
    const deduped = dedupe_sheet_entries_by_id(sheet.entries);

    if (deduped.length !== sheet.entries.length) {
      did_change = true;
      sheet.entries = deduped;
    }
  }

  return did_change;
}
