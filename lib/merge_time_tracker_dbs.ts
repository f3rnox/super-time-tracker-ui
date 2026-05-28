import { DB_VERSION } from "@/lib/config";
import { merge_single_time_tracker_sheet } from "@/lib/merge_single_time_tracker_sheet";
import { pick_merged_active_sheet_name } from "@/lib/pick_merged_active_sheet_name";
import { reconcile_stale_active_entry_ids } from "@/lib/reconcile_stale_active_entry_ids";
import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheet, type TimeTrackerDB } from "@/lib/types";

/**
 * Merges two tracker databases, unioning sheets and reconciling duplicate entries.
 */
export function merge_time_tracker_dbs(
  base: TimeTrackerDB,
  incoming: TimeTrackerDB,
  prefer: MergePreference = "incoming",
): TimeTrackerDB {
  const sheet_names = new Set<string>();

  for (const sheet of base.sheets) {
    sheet_names.add(sheet.name);
  }

  for (const sheet of incoming.sheets) {
    sheet_names.add(sheet.name);
  }

  const sheets: TimeSheet[] = [...sheet_names].map((name) =>
    merge_single_time_tracker_sheet(base, incoming, name, prefer),
  );

  sheets.sort((left, right) => left.name.localeCompare(right.name));

  const active_sheet_name = pick_merged_active_sheet_name(
    base.activeSheetName,
    incoming.activeSheetName,
    sheets,
    prefer,
  );

  const merged: TimeTrackerDB = {
    version: Math.max(base.version, incoming.version, DB_VERSION),
    sheets,
    activeSheetName: active_sheet_name,
  };

  reconcile_stale_active_entry_ids(merged);

  return merged;
}
