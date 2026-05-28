import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  TIMER_SHOW_SECONDS_DEFAULT,
  TIMER_SHOW_SECONDS_STORAGE_KEY,
  type TimerShowSeconds,
} from "@/lib/types/ui_preferences";

const is_timer_show_seconds = (value: string): value is TimerShowSeconds =>
  value === "true" || value === "false";

/**
 * Whether the active timer displays seconds.
 */
export const timer_show_seconds_preference =
  create_ui_preference_store<TimerShowSeconds>({
    storage_key: TIMER_SHOW_SECONDS_STORAGE_KEY,
    default_value: TIMER_SHOW_SECONDS_DEFAULT,
    is_valid: is_timer_show_seconds,
  });
