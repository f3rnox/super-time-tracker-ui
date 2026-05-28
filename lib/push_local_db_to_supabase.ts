import { merge_push_local_to_supabase } from "@/lib/merge_push_local_to_supabase";

/**
 * Merges local db.json into Supabase (local wins ties).
 */
export async function push_local_db_to_supabase(
  user_id: string,
): Promise<void> {
  await merge_push_local_to_supabase(user_id);
}
