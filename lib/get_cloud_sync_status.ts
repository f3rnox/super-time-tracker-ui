import { create_server_supabase_client } from "@/lib/create_server_supabase_client";
import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { is_supabase_configured } from "@/lib/is_supabase_configured";

export interface CloudSyncStatus {
  is_configured: boolean;
  is_signed_in: boolean;
  email: string | null;
  local_imported_at: string | null;
  cloud_sheet_count: number;
}

/**
 * Returns the current cloud sync state for the signed-in user.
 */
export async function get_cloud_sync_status(): Promise<CloudSyncStatus> {
  const status: CloudSyncStatus = {
    is_configured: is_supabase_configured(),
    is_signed_in: false,
    email: null,
    local_imported_at: null,
    cloud_sheet_count: 0,
  };

  if (!status.is_configured) {
    return status;
  }

  const user_id = await get_authenticated_user_id();

  if (user_id === null) {
    return status;
  }

  const supabase = await create_server_supabase_client();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  status.is_signed_in = true;
  status.email = user?.email ?? null;

  const { data: account } = await supabase
    .from("tracker_accounts")
    .select("local_imported_at")
    .eq("user_id", user_id)
    .maybeSingle();

  status.local_imported_at =
    (account as { local_imported_at: string | null } | null)
      ?.local_imported_at ?? null;

  const { count } = await supabase
    .from("sheets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user_id);

  status.cloud_sheet_count = count ?? 0;

  return status;
}
