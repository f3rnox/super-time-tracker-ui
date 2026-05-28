import { schedule_ui_preferences_cloud_sync } from "@/lib/schedule_ui_preferences_cloud_sync";
import { type DefaultSheetSessionMode } from "@/lib/types/ui_settings";
import {
  DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME,
  DEFAULT_SHEET_SESSION_MODE_STORAGE_KEY,
} from "@/lib/types/ui_settings";

/**
 * Persists the default sheet session mode in localStorage and a cookie.
 */
export function write_stored_default_sheet_session_mode(
  mode: DefaultSheetSessionMode,
): void {
  try {
    window.localStorage.setItem(DEFAULT_SHEET_SESSION_MODE_STORAGE_KEY, mode);
    schedule_ui_preferences_cloud_sync();
  } catch {
    // Ignore storage failures in private browsing.
  }

  try {
    document.cookie = `${DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    // Ignore cookie failures.
  }
}
