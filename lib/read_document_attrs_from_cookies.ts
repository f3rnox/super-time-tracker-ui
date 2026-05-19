import { cookies, headers } from "next/headers";

import {
  COLOR_PALETTE_COOKIE_KEY,
  COMPACT_LISTS_COOKIE_KEY,
  THEME_COOKIE_KEY,
  THEME_MODE_COOKIE_KEY,
} from "@/lib/document_preference_cookie_keys";
import { resolve_stored_color_palette } from "@/lib/resolve_stored_color_palette";
import { resolve_theme_mode_to_theme } from "@/lib/resolve_theme_mode_to_theme";
import { theme_mode_preference } from "@/lib/preferences/theme_mode_preference";
import {
  COLOR_PALETTE_DEFAULT,
  type ColorPalette,
  type ThemeMode,
} from "@/lib/types/ui_preferences";
import { type Theme } from "@/lib/types/theme";

export interface DocumentAttrsFromCookies {
  theme: Theme;
  palette: ColorPalette;
  compact_lists: boolean;
}

/**
 * Reads document html attributes from preference cookies for the root layout.
 */
export async function read_document_attrs_from_cookies(): Promise<DocumentAttrsFromCookies> {
  const cookie_store = await cookies();
  const header_store = await headers();
  const prefers_light =
    header_store.get("sec-ch-prefers-color-scheme") === "light";

  const palette_raw = cookie_store.get(COLOR_PALETTE_COOKIE_KEY)?.value;
  const palette = resolve_stored_color_palette(palette_raw, undefined);

  const compact_lists =
    cookie_store.get(COMPACT_LISTS_COOKIE_KEY)?.value === "true";

  const theme_mode_raw = cookie_store.get(THEME_MODE_COOKIE_KEY)?.value;
  const theme_mode = parse_theme_mode(theme_mode_raw);

  if (theme_mode !== null) {
    return {
      theme: resolve_theme_mode_for_request(theme_mode, prefers_light),
      palette,
      compact_lists,
    };
  }

  const theme_raw = cookie_store.get(THEME_COOKIE_KEY)?.value;

  if (theme_raw === "light" || theme_raw === "dark") {
    return {
      theme: theme_raw,
      palette,
      compact_lists,
    };
  }

  return {
    theme: prefers_light ? "light" : "dark",
    palette: palette_raw === undefined ? COLOR_PALETTE_DEFAULT : palette,
    compact_lists,
  };
}

/**
 * Validates a cookie value as a theme mode, or returns null when absent or invalid.
 */
function parse_theme_mode(value: string | undefined): ThemeMode | null {
  if (value === undefined) {
    return null;
  }

  return theme_mode_preference.is_valid(value) ? value : null;
}

/**
 * Resolves a theme mode to a concrete theme, using the request color-scheme hint for system mode.
 */
function resolve_theme_mode_for_request(
  mode: ThemeMode,
  prefers_light: boolean,
): Theme {
  if (mode === "system") {
    return prefers_light ? "light" : "dark";
  }

  return resolve_theme_mode_to_theme(mode);
}
