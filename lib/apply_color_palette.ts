import { type ColorPalette } from '@/lib/types/ui_preferences'

/**
 * Sets the active color palette on the document element.
 */
export function apply_color_palette(value: ColorPalette): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('data-palette', value)
}
