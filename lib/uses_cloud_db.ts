import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { is_supabase_configured } from "@/lib/is_supabase_configured";

/**
 * Returns whether tracker reads/writes should use Supabase for this request.
 */
export async function uses_cloud_db(): Promise<boolean> {
  if (!is_supabase_configured()) {
    return false;
  }

  const user_id = await get_authenticated_user_id();

  return user_id !== null;
}
