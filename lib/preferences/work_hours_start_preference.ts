import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  WORK_HOURS_START_DEFAULT,
  WORK_HOURS_START_STORAGE_KEY,
  type WorkHoursStart,
} from '@/lib/types/ui_preferences'

const work_hours_time_pattern = /^([01]\d|2[0-3]):[0-5]\d$/

const is_work_hours_start = (value: string): value is WorkHoursStart =>
  work_hours_time_pattern.test(value)

/**
 * Start time for reminder work-hours window.
 */
export const work_hours_start_preference = create_ui_preference_store<WorkHoursStart>({
  storage_key: WORK_HOURS_START_STORAGE_KEY,
  default_value: WORK_HOURS_START_DEFAULT,
  is_valid: is_work_hours_start,
})
