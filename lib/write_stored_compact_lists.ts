import { schedule_ui_preferences_cloud_sync } from '@/lib/schedule_ui_preferences_cloud_sync'
import { COMPACT_LISTS_STORAGE_KEY } from '@/lib/types/ui_settings'

/**
 * Persists the compact lists setting to localStorage.
 */
export function write_stored_compact_lists(enabled: boolean): void {
  try {
    window.localStorage.setItem(
      COMPACT_LISTS_STORAGE_KEY,
      enabled ? 'true' : 'false',
    )
    schedule_ui_preferences_cloud_sync()
  } catch {
    // Ignore storage failures in private browsing.
  }
}
