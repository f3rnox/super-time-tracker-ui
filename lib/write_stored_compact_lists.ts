import { COMPACT_LISTS_STORAGE_KEY } from "@/lib/types/ui_settings";

/**
 * Persists the compact lists setting to localStorage.
 */
export function write_stored_compact_lists(enabled: boolean): void {
  try {
    window.localStorage.setItem(
      COMPACT_LISTS_STORAGE_KEY,
      enabled ? "true" : "false",
    );
  } catch {
    // Ignore storage failures in private browsing.
  }
}
