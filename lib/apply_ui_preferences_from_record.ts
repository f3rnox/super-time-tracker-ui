import { apply_ui_preferences_dom_from_window } from '@/lib/apply_ui_preferences_dom_from_window'
import { apply_ui_preferences_record } from '@/lib/apply_ui_preferences_record'
import { type UiPreferencesRecord } from '@/lib/collect_ui_preferences_from_window'
import { notify_all_ui_preference_subscribers } from '@/lib/notify_all_ui_preference_subscribers'
import { resolve_stored_color_palette } from '@/lib/resolve_stored_color_palette'
import { dispatch_ui_preferences_applied_event } from '@/lib/ui_preferences_applied_event'
import {
  ACCENT_COLOR_STORAGE_KEY,
  COLOR_PALETTE_STORAGE_KEY,
} from '@/lib/types/ui_preferences'

/**
 * Writes cloud UI preferences to localStorage and applies them to the UI.
 */
export function apply_ui_preferences_from_record(
  record: UiPreferencesRecord,
): void {
  apply_ui_preferences_record(record)

  const palette = resolve_stored_color_palette(
    record[COLOR_PALETTE_STORAGE_KEY],
    record[ACCENT_COLOR_STORAGE_KEY],
  )

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, palette)

      if (record[COLOR_PALETTE_STORAGE_KEY] !== undefined) {
        window.localStorage.removeItem(ACCENT_COLOR_STORAGE_KEY)
        document.documentElement.removeAttribute('data-accent')
      }
    } catch {
      // Ignore storage failures.
    }
  }

  apply_ui_preferences_dom_from_window()
  notify_all_ui_preference_subscribers()
  dispatch_ui_preferences_applied_event()
}
