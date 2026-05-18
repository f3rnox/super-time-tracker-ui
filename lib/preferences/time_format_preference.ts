import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  TIME_FORMAT_DEFAULT,
  TIME_FORMAT_STORAGE_KEY,
  type TimeFormat,
} from '@/lib/types/ui_preferences'

const is_time_format = (value: string): value is TimeFormat =>
  value === '12h' || value === '24h'

/**
 * Time format preference store: 12h or 24h.
 */
export const time_format_preference = create_ui_preference_store<TimeFormat>({
  storage_key: TIME_FORMAT_STORAGE_KEY,
  default_value: TIME_FORMAT_DEFAULT,
  is_valid: is_time_format,
})
