import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Clears activeEntryID when it no longer points to a running entry.
 */
export function reconcile_stale_active_entry_ids(db: TimeTrackerDB): boolean {
  let did_change = false;

  for (const sheet of db.sheets) {
    if (sheet.activeEntryID === null) {
      continue;
    }

    if (find_running_entry_on_sheet(sheet) === null) {
      sheet.activeEntryID = null;
      did_change = true;
    }
  }

  return did_change;
}
