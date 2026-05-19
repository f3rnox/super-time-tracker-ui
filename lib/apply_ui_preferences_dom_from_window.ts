import { apply_color_palette } from "@/lib/apply_color_palette";
import { apply_compact_lists } from "@/lib/apply_compact_lists";
import { apply_theme } from "@/lib/apply_theme";
import { theme_mode_preference } from "@/lib/preferences/theme_mode_preference";
import { read_stored_color_palette_from_window } from "@/lib/resolve_stored_color_palette";
import { resolve_theme_mode_to_theme } from "@/lib/resolve_theme_mode_to_theme";
import { sync_document_preference_cookies_from_window } from "@/lib/sync_document_preference_cookies_from_window";
import { COMPACT_LISTS_STORAGE_KEY } from "@/lib/types/ui_settings";
import {
  THEME_MODE_STORAGE_KEY,
  type ThemeMode,
} from "@/lib/types/ui_preferences";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/types/theme";

/**
 * Applies theme, palette, and compact-list attributes from localStorage to the document.
 */
export function apply_ui_preferences_dom_from_window(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const compact_lists = window.localStorage.getItem(
      COMPACT_LISTS_STORAGE_KEY,
    );

    if (compact_lists === "true" || compact_lists === "false") {
      apply_compact_lists(compact_lists === "true");
    }
  } catch {
    // Ignore storage failures.
  }

  try {
    const theme_mode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);

    if (theme_mode !== null && theme_mode_preference.is_valid(theme_mode)) {
      apply_theme(resolve_theme_mode_to_theme(theme_mode as ThemeMode));
    } else {
      const theme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (theme === "light" || theme === "dark") {
        apply_theme(theme as Theme);
      }
    }
  } catch {
    // Ignore storage failures.
  }

  apply_color_palette(read_stored_color_palette_from_window());
  sync_document_preference_cookies_from_window();
}
