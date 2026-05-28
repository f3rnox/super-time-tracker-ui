import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { is_supabase_configured } from "@/lib/is_supabase_configured";
import { merge_time_tracker_dbs } from "@/lib/merge_time_tracker_dbs";
import { reconcile_stale_active_entry_ids } from "@/lib/reconcile_stale_active_entry_ids";
import { read_local_db_if_exists } from "@/lib/read_local_db_if_exists";
import { read_supabase_db } from "@/lib/read_supabase_db";
import { write_local_db } from "@/lib/write_local_db";
import { type TimeTrackerDB } from "@/lib/types";

export interface SyncTrackerDbOnLoadResult {
  synced: boolean;
  merged: TimeTrackerDB | null;
}

/**
 * Merges local db.json with cloud data on load and persists the result locally.
 */
export async function sync_tracker_db_on_load(
  authenticated_user_id?: string | null,
): Promise<SyncTrackerDbOnLoadResult> {
  if (!is_supabase_configured()) {
    return { synced: false, merged: null };
  }

  const user_id =
    authenticated_user_id === undefined
      ? await get_authenticated_user_id()
      : authenticated_user_id;

  if (user_id === null) {
    return { synced: false, merged: null };
  }

  const cloud_db = await read_supabase_db(user_id);
  const local_db = await read_local_db_if_exists();

  if (local_db === null) {
    if (cloud_db.sheets.length > 0) {
      await write_local_db(cloud_db);
      return { synced: true, merged: cloud_db };
    }

    return { synced: false, merged: cloud_db };
  }

  if (cloud_db.sheets.length === 0) {
    await write_local_db(local_db);
    return { synced: true, merged: local_db };
  }

  const merged = merge_time_tracker_dbs(cloud_db, local_db, "incoming");

  reconcile_stale_active_entry_ids(merged);

  await write_local_db(merged);

  return { synced: true, merged };
}
