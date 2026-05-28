import { create_server_supabase_client } from "@/lib/create_server_supabase_client";
import { type UiPreferencesRecord } from "@/lib/collect_ui_preferences_from_window";

/**
 * Persists UI preferences for the signed-in user in Supabase.
 */
export async function write_supabase_ui_preferences(
  user_id: string,
  preferences: UiPreferencesRecord,
): Promise<UiPreferencesRecord> {
  const supabase = await create_server_supabase_client();

  const { data: existing, error: read_error } = await supabase
    .from("tracker_accounts")
    .select("ui_preferences")
    .eq("user_id", user_id)
    .maybeSingle();

  if (read_error !== null) {
    throw new Error(`Failed to read UI preferences: ${read_error.message}`);
  }

  const cloud_raw = (existing as { ui_preferences?: unknown } | null)
    ?.ui_preferences;
  const cloud: UiPreferencesRecord = {};

  if (
    typeof cloud_raw === "object" &&
    cloud_raw !== null &&
    !Array.isArray(cloud_raw)
  ) {
    for (const [key, value] of Object.entries(cloud_raw)) {
      if (typeof value === "string") {
        cloud[key] = value;
      }
    }
  }

  const merged = { ...cloud, ...preferences };

  const { error: write_error } = await supabase.from("tracker_accounts").upsert(
    {
      user_id,
      ui_preferences: merged,
    },
    { onConflict: "user_id" },
  );

  if (write_error !== null) {
    throw new Error(`Failed to save UI preferences: ${write_error.message}`);
  }

  return merged;
}
