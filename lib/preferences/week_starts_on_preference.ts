import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  WEEK_STARTS_ON_DEFAULT,
  WEEK_STARTS_ON_STORAGE_KEY,
  type WeekStartsOn,
} from "@/lib/types/ui_preferences";

const is_week_starts_on = (value: string): value is WeekStartsOn =>
  value === "monday" || value === "sunday";

/**
 * Week start preference store: monday or sunday.
 */
export const week_starts_on_preference =
  create_ui_preference_store<WeekStartsOn>({
    storage_key: WEEK_STARTS_ON_STORAGE_KEY,
    default_value: WEEK_STARTS_ON_DEFAULT,
    is_valid: is_week_starts_on,
  });
