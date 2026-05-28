import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  TOPBAR_QUICK_ACTIONS_DEFAULT,
  TOPBAR_QUICK_ACTIONS_STORAGE_KEY,
  type TopbarQuickActionsJson,
} from "@/lib/types/ui_preferences";

const is_topbar_quick_actions_json = (
  value: string,
): value is TopbarQuickActionsJson => {
  if (value.length === 0) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed);
  } catch {
    return false;
  }
};

/**
 * JSON array of enabled quick links in the topbar.
 */
export const topbar_quick_actions_preference =
  create_ui_preference_store<TopbarQuickActionsJson>({
    storage_key: TOPBAR_QUICK_ACTIONS_STORAGE_KEY,
    default_value: TOPBAR_QUICK_ACTIONS_DEFAULT,
    is_valid: is_topbar_quick_actions_json,
  });
