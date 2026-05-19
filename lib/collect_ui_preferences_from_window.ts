import { list_ui_preference_storage_keys } from '@/lib/list_ui_preference_storage_keys'

export type UiPreferencesRecord = Record<string, string>

/**
 * Reads all syncable UI preference keys from localStorage.
 */
export function collect_ui_preferences_from_window(): UiPreferencesRecord {
  const record: UiPreferencesRecord = {}

  if (typeof window === 'undefined') {
    return record
  }

  for (const key of list_ui_preference_storage_keys()) {
    try {
      const value = window.localStorage.getItem(key)

      if (value !== null) {
        record[key] = value
      }
    } catch {
      // Ignore storage failures.
    }
  }

  return record
}
