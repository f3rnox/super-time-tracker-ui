import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  FOCUS_GOALS_PER_TAG_DEFAULT,
  FOCUS_GOALS_PER_TAG_STORAGE_KEY,
  type FocusGoalsPerTagJson,
} from '@/lib/types/ui_preferences'

const is_focus_goals_per_tag_json = (
  value: string,
): value is FocusGoalsPerTagJson => {
  if (value.length === 0) {
    return false
  }

  try {
    const parsed: unknown = JSON.parse(value)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
  } catch {
    return false
  }
}

/**
 * JSON-encoded daily/weekly target minutes keyed by tag name.
 */
export const focus_goals_per_tag_preference =
  create_ui_preference_store<FocusGoalsPerTagJson>({
    storage_key: FOCUS_GOALS_PER_TAG_STORAGE_KEY,
    default_value: FOCUS_GOALS_PER_TAG_DEFAULT,
    is_valid: is_focus_goals_per_tag_json,
  })
