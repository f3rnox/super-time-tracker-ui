import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  WORK_HOURS_END_DEFAULT,
  WORK_HOURS_END_STORAGE_KEY,
  type WorkHoursEnd,
} from '@/lib/types/ui_preferences'

const work_hours_time_pattern = /^([01]\d|2[0-3]):[0-5]\d$/

const is_work_hours_end = (value: string): value is WorkHoursEnd =>
  work_hours_time_pattern.test(value)

/**
 * End time for reminder work-hours window.
 */
export const work_hours_end_preference = create_ui_preference_store<WorkHoursEnd>({
  storage_key: WORK_HOURS_END_STORAGE_KEY,
  default_value: WORK_HOURS_END_DEFAULT,
  is_valid: is_work_hours_end,
})
