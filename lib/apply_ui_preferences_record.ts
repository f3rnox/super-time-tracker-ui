import { type UiPreferencesRecord } from "@/lib/collect_ui_preferences_from_window";

/**
 * Writes synced UI preferences into localStorage.
 */
export function apply_ui_preferences_record(record: UiPreferencesRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const [key, value] of Object.entries(record)) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures.
    }
  }
}
