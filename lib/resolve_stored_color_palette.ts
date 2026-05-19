import {
  ACCENT_COLOR_STORAGE_KEY,
  COLOR_PALETTE_DEFAULT,
  COLOR_PALETTE_STORAGE_KEY,
  COLOR_PALETTE_VALUES,
  type ColorPalette,
} from '@/lib/types/ui_preferences'

const accent_to_palette_migration: Record<string, ColorPalette> = {
  teal: 'default',
  blue: 'ocean',
  violet: 'midnight',
  rose: 'warm',
  amber: 'warm',
  emerald: 'forest',
}

/**
 * Resolves a stored color palette value, including legacy accent migration.
 */
export function resolve_stored_color_palette(
  stored_palette: string | undefined,
  stored_accent: string | undefined,
): ColorPalette {
  if (
    stored_palette !== undefined &&
    COLOR_PALETTE_VALUES.includes(stored_palette as ColorPalette)
  ) {
    return stored_palette as ColorPalette
  }

  if (stored_accent !== undefined) {
    const migrated = accent_to_palette_migration[stored_accent]

    if (migrated !== undefined) {
      return migrated
    }
  }

  return COLOR_PALETTE_DEFAULT
}

/**
 * Reads the color palette from localStorage when available.
 */
export function read_stored_color_palette_from_window(): ColorPalette {
  if (typeof window === 'undefined') {
    return COLOR_PALETTE_DEFAULT
  }

  try {
    return resolve_stored_color_palette(
      window.localStorage.getItem(COLOR_PALETTE_STORAGE_KEY) ?? undefined,
      window.localStorage.getItem(ACCENT_COLOR_STORAGE_KEY) ?? undefined,
    )
  } catch {
    return COLOR_PALETTE_DEFAULT
  }
}
