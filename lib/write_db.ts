import { dedupe_tracker_db_sheet_entries } from "@/lib/dedupe_tracker_db_sheet_entries";
import { reconcile_stale_active_entry_ids } from "@/lib/reconcile_stale_active_entry_ids";
import { write_local_db } from "@/lib/write_local_db";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Persists the in-memory database to local storage (cloud sync runs in the background).
 */
export async function write_db(
  db: TimeTrackerDB,
  db_path?: string,
): Promise<void> {
  reconcile_stale_active_entry_ids(db);
  dedupe_tracker_db_sheet_entries(db);
  await write_local_db(db, db_path);
}
