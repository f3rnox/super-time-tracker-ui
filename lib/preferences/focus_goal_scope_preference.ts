import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  FOCUS_GOAL_SCOPE_DEFAULT,
  FOCUS_GOAL_SCOPE_STORAGE_KEY,
  type FocusGoalScope,
} from '@/lib/types/ui_preferences'

const is_focus_goal_scope = (value: string): value is FocusGoalScope =>
  value === 'global' || value === 'sheet' || value === 'tag'

/**
 * Scope used for focus goals: global, selected sheet, or selected tag.
 */
export const focus_goal_scope_preference = create_ui_preference_store<FocusGoalScope>(
  {
    storage_key: FOCUS_GOAL_SCOPE_STORAGE_KEY,
    default_value: FOCUS_GOAL_SCOPE_DEFAULT,
    is_valid: is_focus_goal_scope,
  },
)
