import { THEME_STORAGE_KEY, type Theme } from "@/lib/types/theme";

/**
 * Reads the persisted theme from localStorage, if present.
 */
export function read_stored_theme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}
