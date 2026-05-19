import { write_document_preference_cookies } from "@/lib/write_document_preference_cookies";
import { theme_mode_preference } from "@/lib/preferences/theme_mode_preference";
import { read_stored_color_palette_from_window } from "@/lib/resolve_stored_color_palette";
import { resolve_theme_mode_to_theme } from "@/lib/resolve_theme_mode_to_theme";
import { COMPACT_LISTS_STORAGE_KEY } from "@/lib/types/ui_settings";

/**
 * Mirrors localStorage UI preferences into cookies for the next server render.
 */
export function sync_document_preference_cookies_from_window(): void {
  if (typeof window === "undefined") {
    return;
  }

  const theme_mode = theme_mode_preference.read();
  const compact_lists =
    window.localStorage.getItem(COMPACT_LISTS_STORAGE_KEY) === "true";

  write_document_preference_cookies({
    theme_mode,
    theme: resolve_theme_mode_to_theme(theme_mode),
    palette: read_stored_color_palette_from_window(),
    compact_lists,
  });
}
