import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  COLOR_PALETTE_DEFAULT,
  COLOR_PALETTE_STORAGE_KEY,
  COLOR_PALETTE_VALUES,
  type ColorPalette,
} from "@/lib/types/ui_preferences";

const valid_set = new Set<string>(COLOR_PALETTE_VALUES);

const is_color_palette = (value: string): value is ColorPalette =>
  valid_set.has(value);

/**
 * Base color palette preference store (surfaces and backgrounds).
 */
export const color_palette_preference =
  create_ui_preference_store<ColorPalette>({
    storage_key: COLOR_PALETTE_STORAGE_KEY,
    default_value: COLOR_PALETTE_DEFAULT,
    is_valid: is_color_palette,
  });
