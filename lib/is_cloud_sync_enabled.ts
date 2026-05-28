import {
  CLOUD_SYNC_ENABLED_DEFAULT,
  CLOUD_SYNC_ENABLED_STORAGE_KEY,
} from "@/lib/types/ui_preferences";

/**
 * Returns true when cloud sync is enabled in local preferences.
 */
export function is_cloud_sync_enabled(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const value = window.localStorage.getItem(CLOUD_SYNC_ENABLED_STORAGE_KEY);
    return value === null
      ? CLOUD_SYNC_ENABLED_DEFAULT === "true"
      : value === "true";
  } catch {
    return true;
  }
}
