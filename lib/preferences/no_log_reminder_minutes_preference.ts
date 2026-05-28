import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  NO_LOG_REMINDER_MINUTES_DEFAULT,
  NO_LOG_REMINDER_MINUTES_STORAGE_KEY,
  type NoLogReminderMinutes,
} from "@/lib/types/ui_preferences";

const is_no_log_reminder_minutes = (
  value: string,
): value is NoLogReminderMinutes => {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const minutes = Number.parseInt(value, 10);
  return minutes >= 5 && minutes <= 240;
};

/**
 * Reminder interval when no activity is logged.
 */
export const no_log_reminder_minutes_preference =
  create_ui_preference_store<NoLogReminderMinutes>({
    storage_key: NO_LOG_REMINDER_MINUTES_STORAGE_KEY,
    default_value: NO_LOG_REMINDER_MINUTES_DEFAULT,
    is_valid: is_no_log_reminder_minutes,
  });
