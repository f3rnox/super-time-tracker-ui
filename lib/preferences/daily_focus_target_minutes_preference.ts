import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  DAILY_FOCUS_TARGET_MINUTES_DEFAULT,
  DAILY_FOCUS_TARGET_MINUTES_STORAGE_KEY,
  type DailyFocusTargetMinutes,
} from '@/lib/types/ui_preferences'

const is_daily_focus_target_minutes = (
  value: string,
): value is DailyFocusTargetMinutes => {
  if (!/^\d+$/.test(value)) {
    return false
  }

  const minutes = Number.parseInt(value, 10)
  return minutes >= 30 && minutes <= 720
}

/**
 * Daily focus target in minutes.
 */
export const daily_focus_target_minutes_preference =
  create_ui_preference_store<DailyFocusTargetMinutes>({
    storage_key: DAILY_FOCUS_TARGET_MINUTES_STORAGE_KEY,
    default_value: DAILY_FOCUS_TARGET_MINUTES_DEFAULT,
    is_valid: is_daily_focus_target_minutes,
  })
