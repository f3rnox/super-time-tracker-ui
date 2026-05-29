import { supports_supabase_archive_columns } from "@/lib/supports_supabase_archive_columns";
import { supports_supabase_tasks } from "@/lib/supports_supabase_tasks";

/**
 * Picks the db_version stored on tracker_accounts without claiming new schema early.
 */
export function get_supabase_persisted_db_version(
  local_version: number,
  cloud_db_version: number | undefined,
): number {
  if (supports_supabase_tasks(cloud_db_version)) {
    return local_version;
  }

  if (supports_supabase_archive_columns(cloud_db_version)) {
    return Math.min(local_version, 4);
  }

  return Math.min(local_version, 3);
}
