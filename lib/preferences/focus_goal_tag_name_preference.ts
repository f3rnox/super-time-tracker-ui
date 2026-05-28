import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  FOCUS_GOAL_TAG_NAME_DEFAULT,
  FOCUS_GOAL_TAG_NAME_STORAGE_KEY,
  type FocusGoalTagName,
} from "@/lib/types/ui_preferences";

const is_focus_goal_tag_name = (value: string): value is FocusGoalTagName =>
  value.trim().length > 0;

/**
 * Selected tag used when goal scope is per-tag.
 */
export const focus_goal_tag_name_preference =
  create_ui_preference_store<FocusGoalTagName>({
    storage_key: FOCUS_GOAL_TAG_NAME_STORAGE_KEY,
    default_value: FOCUS_GOAL_TAG_NAME_DEFAULT,
    is_valid: is_focus_goal_tag_name,
  });
