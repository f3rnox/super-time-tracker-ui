import { apply_color_palette } from '@/lib/apply_color_palette'
import { apply_compact_lists } from '@/lib/apply_compact_lists'
import { apply_theme } from '@/lib/apply_theme'
import { apply_ui_preferences_record } from '@/lib/apply_ui_preferences_record'
import { type UiPreferencesRecord } from '@/lib/collect_ui_preferences_from_window'
import { notify_all_ui_preference_subscribers } from '@/lib/notify_all_ui_preference_subscribers'
import { theme_mode_preference } from '@/lib/preferences/theme_mode_preference'
import { resolve_stored_color_palette } from '@/lib/resolve_stored_color_palette'
import { resolve_theme_mode_to_theme } from '@/lib/resolve_theme_mode_to_theme'
import { COMPACT_LISTS_STORAGE_KEY } from '@/lib/types/ui_settings'
import {
  ACCENT_COLOR_STORAGE_KEY,
  COLOR_PALETTE_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/types/ui_preferences'
import { THEME_STORAGE_KEY, type Theme } from '@/lib/types/theme'

/**
 * Writes cloud UI preferences to localStorage and applies them to the UI.
 */
export function apply_ui_preferences_from_record(
  record: UiPreferencesRecord,
): void {
  apply_ui_preferences_record(record)

  const compact_lists = record[COMPACT_LISTS_STORAGE_KEY]

  if (compact_lists === 'true' || compact_lists === 'false') {
    apply_compact_lists(compact_lists === 'true')
  }

  const theme_mode = record[THEME_MODE_STORAGE_KEY]

  if (theme_mode !== undefined && theme_mode_preference.is_valid(theme_mode)) {
    apply_theme(resolve_theme_mode_to_theme(theme_mode as ThemeMode))
  } else {
    const theme = record[THEME_STORAGE_KEY]

    if (theme === 'light' || theme === 'dark') {
      apply_theme(theme as Theme)
    }
  }

  const palette = resolve_stored_color_palette(
    record[COLOR_PALETTE_STORAGE_KEY],
    record[ACCENT_COLOR_STORAGE_KEY],
  )

  apply_color_palette(palette)

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, palette)
    } catch {
      // Ignore storage failures.
    }
  }

  notify_all_ui_preference_subscribers()
}
