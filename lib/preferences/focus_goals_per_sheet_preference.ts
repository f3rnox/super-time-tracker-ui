import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  FOCUS_GOALS_PER_SHEET_DEFAULT,
  FOCUS_GOALS_PER_SHEET_STORAGE_KEY,
  type FocusGoalsPerSheetJson,
} from '@/lib/types/ui_preferences'

const is_focus_goals_per_sheet_json = (
  value: string,
): value is FocusGoalsPerSheetJson => {
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
 * JSON-encoded daily/weekly target minutes keyed by sheet name.
 */
export const focus_goals_per_sheet_preference =
  create_ui_preference_store<FocusGoalsPerSheetJson>({
    storage_key: FOCUS_GOALS_PER_SHEET_STORAGE_KEY,
    default_value: FOCUS_GOALS_PER_SHEET_DEFAULT,
    is_valid: is_focus_goals_per_sheet_json,
  })
