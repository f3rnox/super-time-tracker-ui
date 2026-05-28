import { schedule_ui_preferences_cloud_sync } from "@/lib/schedule_ui_preferences_cloud_sync";
import {
  ACTIVE_SHEET_COOKIE_NAME,
  ACTIVE_SHEET_STORAGE_KEY,
} from "@/lib/types/ui_settings";

/**
 * Persists the last opened sheet in localStorage and a cookie for SSR reloads.
 */
export function write_active_sheet_preference(sheet_name: string): void {
  const trimmed = sheet_name.trim();

  if (trimmed.length === 0) {
    return;
  }

  try {
    window.localStorage.setItem(ACTIVE_SHEET_STORAGE_KEY, trimmed);
    schedule_ui_preferences_cloud_sync();
  } catch {
    // Ignore storage failures in private browsing.
  }

  try {
    const encoded = encodeURIComponent(trimmed);
    document.cookie = `${ACTIVE_SHEET_COOKIE_NAME}=${encoded}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    // Ignore cookie failures.
  }
}
