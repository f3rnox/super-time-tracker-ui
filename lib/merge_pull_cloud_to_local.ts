import { merge_time_tracker_dbs } from "@/lib/merge_time_tracker_dbs";
import { read_local_db_if_exists } from "@/lib/read_local_db_if_exists";
import { read_supabase_db } from "@/lib/read_supabase_db";
import { write_local_db } from "@/lib/write_local_db";
import { write_supabase_db } from "@/lib/write_supabase_db";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Merges local db.json with cloud, then persists to both (cloud wins ties).
 */
export async function merge_pull_cloud_to_local(
  user_id: string,
): Promise<TimeTrackerDB> {
  const cloud_db = await read_supabase_db(user_id);
  const local_db = await read_local_db_if_exists();
  const merged =
    local_db === null
      ? cloud_db
      : merge_time_tracker_dbs(local_db, cloud_db, "incoming");

  await write_local_db(merged);
  await write_supabase_db(merged, user_id);

  return merged;
}
