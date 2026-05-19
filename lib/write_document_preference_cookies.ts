import {
  COLOR_PALETTE_COOKIE_KEY,
  COMPACT_LISTS_COOKIE_KEY,
  THEME_COOKIE_KEY,
  THEME_MODE_COOKIE_KEY,
} from "@/lib/document_preference_cookie_keys";
import { type ColorPalette, type ThemeMode } from "@/lib/types/ui_preferences";
import { type Theme } from "@/lib/types/theme";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface DocumentPreferenceCookies {
  theme_mode?: ThemeMode;
  theme?: Theme;
  palette?: ColorPalette;
  compact_lists?: boolean;
}

/**
 * Persists document-level UI preferences in cookies for server-rendered html attributes.
 */
export function write_document_preference_cookies(
  values: DocumentPreferenceCookies,
): void {
  if (typeof document === "undefined") {
    return;
  }

  const base = `path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;

  if (values.theme_mode !== undefined) {
    document.cookie = `${THEME_MODE_COOKIE_KEY}=${values.theme_mode}; ${base}`;
  }

  if (values.theme !== undefined) {
    document.cookie = `${THEME_COOKIE_KEY}=${values.theme}; ${base}`;
  }

  if (values.palette !== undefined) {
    document.cookie = `${COLOR_PALETTE_COOKIE_KEY}=${values.palette}; ${base}`;
  }

  if (values.compact_lists !== undefined) {
    document.cookie = `${COMPACT_LISTS_COOKIE_KEY}=${values.compact_lists ? "true" : "false"}; ${base}`;
  }
}
