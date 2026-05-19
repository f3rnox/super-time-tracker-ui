import { schedule_ui_preferences_cloud_sync } from '@/lib/schedule_ui_preferences_cloud_sync'
import { THEME_STORAGE_KEY, type Theme } from '@/lib/types/theme'

/**
 * Persists the active theme to localStorage.
 */
export function write_stored_theme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    schedule_ui_preferences_cloud_sync()
  } catch {
    // Storage may be unavailable in private browsing or restricted contexts.
  }
}
