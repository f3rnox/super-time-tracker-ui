import { read_local_db } from "@/lib/read_local_db";
import { write_supabase_db } from "@/lib/write_supabase_db";

/**
 * Uploads the on-disk db.json to Supabase without re-merging.
 */
export async function write_local_tracker_db_to_supabase(
  user_id: string,
): Promise<void> {
  const local_db = await read_local_db();

  await write_supabase_db(local_db, user_id);
}
