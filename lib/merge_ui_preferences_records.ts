import { type UiPreferencesRecord } from "@/lib/collect_ui_preferences_from_window";
import { list_ui_preference_storage_keys } from "@/lib/list_ui_preference_storage_keys";
import {
  ACCENT_COLOR_STORAGE_KEY,
  COLOR_PALETTE_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
} from "@/lib/types/ui_preferences";
import { THEME_STORAGE_KEY } from "@/lib/types/theme";

export type UiPreferencesMergeWinner = "local" | "cloud";

/**
 * Merges local and cloud UI preference records per known storage key.
 */
export function merge_ui_preferences_records(
  local: UiPreferencesRecord,
  cloud: UiPreferencesRecord,
  winner: UiPreferencesMergeWinner,
): UiPreferencesRecord {
  const merged: UiPreferencesRecord = {};
  const keys = new Set([
    ...list_ui_preference_storage_keys(),
    ...Object.keys(local),
    ...Object.keys(cloud),
  ]);

  for (const key of keys) {
    const local_value = local[key];
    const cloud_value = cloud[key];
    const picked =
      winner === "cloud"
        ? (cloud_value ?? local_value)
        : (local_value ?? cloud_value);

    if (picked !== undefined) {
      merged[key] = picked;
    }
  }

  if (merged[THEME_MODE_STORAGE_KEY] !== undefined) {
    delete merged[THEME_STORAGE_KEY];
  }

  if (merged[COLOR_PALETTE_STORAGE_KEY] !== undefined) {
    delete merged[ACCENT_COLOR_STORAGE_KEY];
  }

  return merged;
}
