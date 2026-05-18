import { THEME_STORAGE_KEY, type Theme } from "@/lib/types/theme";

/**
 * Persists the active theme to localStorage.
 */
export function write_stored_theme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable in private browsing or restricted contexts.
  }
}
