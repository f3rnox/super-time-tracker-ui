import { type UiPreferencesRecord } from "@/lib/collect_ui_preferences_from_window";
import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { is_supabase_configured } from "@/lib/is_supabase_configured";
import { merge_ui_preferences_records } from "@/lib/merge_ui_preferences_records";
import { read_supabase_ui_preferences } from "@/lib/read_supabase_ui_preferences";
import { replace_supabase_ui_preferences } from "@/lib/replace_supabase_ui_preferences";

export interface SyncUiPreferencesOnLoadResult {
  synced: boolean;
  merged: UiPreferencesRecord;
}

/**
 * Merges local UI preferences with cloud data on load (cloud wins conflicts).
 */
export async function sync_ui_preferences_on_load(
  local: UiPreferencesRecord,
  authenticated_user_id?: string | null,
): Promise<SyncUiPreferencesOnLoadResult> {
  if (!is_supabase_configured()) {
    return { synced: false, merged: local };
  }

  const user_id =
    authenticated_user_id === undefined
      ? await get_authenticated_user_id()
      : authenticated_user_id;

  if (user_id === null) {
    return { synced: false, merged: local };
  }

  const cloud = await read_supabase_ui_preferences(user_id);
  const local_has_values = Object.keys(local).length > 0;
  const cloud_has_values = Object.keys(cloud).length > 0;

  if (!local_has_values && !cloud_has_values) {
    return { synced: false, merged: {} };
  }

  if (!cloud_has_values) {
    if (local_has_values) {
      await replace_supabase_ui_preferences(user_id, local);
    }

    return { synced: local_has_values, merged: local };
  }

  if (!local_has_values) {
    return { synced: true, merged: cloud };
  }

  const merged = merge_ui_preferences_records(local, cloud, "cloud");

  await replace_supabase_ui_preferences(user_id, merged);

  return { synced: true, merged };
}
