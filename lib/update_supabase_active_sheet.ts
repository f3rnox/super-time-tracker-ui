import { DB_VERSION } from "@/lib/config";
import { create_server_supabase_client } from "@/lib/create_server_supabase_client";

/**
 * Updates only the active sheet name in Supabase (fast path for sheet switches).
 */
export async function update_supabase_active_sheet(
  user_id: string,
  active_sheet_name: string,
): Promise<void> {
  const supabase = await create_server_supabase_client();
  const { data: account_row, error: read_error } = await supabase
    .from("tracker_accounts")
    .select("db_version")
    .eq("user_id", user_id)
    .maybeSingle();

  if (read_error !== null) {
    throw new Error(`Failed to load tracker account: ${read_error.message}`);
  }

  const { error } = await supabase.from("tracker_accounts").upsert(
    {
      user_id,
      active_sheet_name,
      db_version:
        (account_row as { db_version?: number } | null)?.db_version ??
        DB_VERSION,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error !== null) {
    throw new Error(`Failed to update active sheet: ${error.message}`);
  }
}
