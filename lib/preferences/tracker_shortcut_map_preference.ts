import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  TRACKER_SHORTCUT_MAP_DEFAULT,
  TRACKER_SHORTCUT_MAP_STORAGE_KEY,
  type TrackerShortcutMapJson,
} from '@/lib/types/ui_preferences'

const is_tracker_shortcut_map_json = (
  value: string,
): value is TrackerShortcutMapJson => {
  if (value.length === 0) {
    return false
  }

  try {
    const parsed = JSON.parse(value) as unknown
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
  } catch {
    return false
  }
}

/**
 * JSON-encoded keyboard shortcut keys for tracker quick actions.
 */
export const tracker_shortcut_map_preference =
  create_ui_preference_store<TrackerShortcutMapJson>({
    storage_key: TRACKER_SHORTCUT_MAP_STORAGE_KEY,
    default_value: TRACKER_SHORTCUT_MAP_DEFAULT,
    is_valid: is_tracker_shortcut_map_json,
  })
