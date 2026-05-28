import { DB_PATH } from "@/lib/config";
import { uses_cloud_db } from "@/lib/uses_cloud_db";

/**
 * Returns a human-readable label for where tracker data is stored.
 */
export async function resolve_db_path_label(): Promise<string> {
  if (await uses_cloud_db()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "Supabase";

    return `Cloud sync (${url})`;
  }

  return DB_PATH;
}
