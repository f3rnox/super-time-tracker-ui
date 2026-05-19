import { apply_color_palette } from "@/lib/apply_color_palette";
import { color_palette_preference } from "@/lib/preferences/color_palette_preference";
import { write_document_preference_cookies } from "@/lib/write_document_preference_cookies";
import { type ColorPalette } from "@/lib/types/ui_preferences";

/**
 * Persists the color palette preference, applies it, and notifies subscribers.
 */
export function set_color_palette(value: ColorPalette): void {
  color_palette_preference.write(value);
  apply_color_palette(value);
  write_document_preference_cookies({ palette: value });
  color_palette_preference.notify();
}
