import { merge_pull_cloud_to_local } from "@/lib/merge_pull_cloud_to_local";

/**
 * Merges cloud data into local db.json (cloud wins ties).
 */
export async function pull_supabase_db_to_local(
  user_id: string,
): Promise<void> {
  await merge_pull_cloud_to_local(user_id);
}
