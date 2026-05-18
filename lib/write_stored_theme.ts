import { THEME_STORAGE_KEY, type Theme } from "@/lib/types/theme";

/**
 * Persists the active theme to localStorage.
 */
export function write_stored_theme(theme: Theme): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
