import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  WEEKLY_FOCUS_TARGET_MINUTES_DEFAULT,
  WEEKLY_FOCUS_TARGET_MINUTES_STORAGE_KEY,
  type WeeklyFocusTargetMinutes,
} from '@/lib/types/ui_preferences'

const is_weekly_focus_target_minutes = (
  value: string,
): value is WeeklyFocusTargetMinutes => {
  if (!/^\d+$/.test(value)) {
    return false
  }

  const minutes = Number.parseInt(value, 10)
  return minutes >= 60 && minutes <= 4200
}

/**
 * Weekly focus target in minutes.
 */
export const weekly_focus_target_minutes_preference =
  create_ui_preference_store<WeeklyFocusTargetMinutes>({
    storage_key: WEEKLY_FOCUS_TARGET_MINUTES_STORAGE_KEY,
    default_value: WEEKLY_FOCUS_TARGET_MINUTES_DEFAULT,
    is_valid: is_weekly_focus_target_minutes,
  })
