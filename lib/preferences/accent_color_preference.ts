import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  ACCENT_COLOR_DEFAULT,
  ACCENT_COLOR_STORAGE_KEY,
  ACCENT_COLOR_VALUES,
  type AccentColor,
} from "@/lib/types/ui_preferences";

const valid_set = new Set<string>(ACCENT_COLOR_VALUES);

const is_accent_color = (value: string): value is AccentColor =>
  valid_set.has(value);

/**
 * Accent color preset preference store.
 */
export const accent_color_preference = create_ui_preference_store<AccentColor>({
  storage_key: ACCENT_COLOR_STORAGE_KEY,
  default_value: ACCENT_COLOR_DEFAULT,
  is_valid: is_accent_color,
});
