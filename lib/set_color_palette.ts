import { apply_color_palette } from '@/lib/apply_color_palette'
import { color_palette_preference } from '@/lib/preferences/color_palette_preference'
import { type ColorPalette } from '@/lib/types/ui_preferences'

/**
 * Persists the color palette preference, applies it, and notifies subscribers.
 */
export function set_color_palette(value: ColorPalette): void {
  color_palette_preference.write(value)
  apply_color_palette(value)
  color_palette_preference.notify()
}
