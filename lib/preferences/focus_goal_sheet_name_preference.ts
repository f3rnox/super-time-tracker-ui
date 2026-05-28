import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  FOCUS_GOAL_SHEET_NAME_DEFAULT,
  FOCUS_GOAL_SHEET_NAME_STORAGE_KEY,
  type FocusGoalSheetName,
} from '@/lib/types/ui_preferences'

const is_focus_goal_sheet_name = (value: string): value is FocusGoalSheetName =>
  value.trim().length > 0

/**
 * Selected sheet used when goal scope is per-sheet.
 */
export const focus_goal_sheet_name_preference =
  create_ui_preference_store<FocusGoalSheetName>({
    storage_key: FOCUS_GOAL_SHEET_NAME_STORAGE_KEY,
    default_value: FOCUS_GOAL_SHEET_NAME_DEFAULT,
    is_valid: is_focus_goal_sheet_name,
  })
