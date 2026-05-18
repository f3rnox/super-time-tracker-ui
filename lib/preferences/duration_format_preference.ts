import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  DURATION_FORMAT_DEFAULT,
  DURATION_FORMAT_STORAGE_KEY,
  type DurationFormat,
} from '@/lib/types/ui_preferences'

const is_duration_format = (value: string): value is DurationFormat =>
  value === 'humanized' || value === 'clock' || value === 'decimal'

/**
 * Duration format preference store: humanized, clock, or decimal.
 */
export const duration_format_preference =
  create_ui_preference_store<DurationFormat>({
    storage_key: DURATION_FORMAT_STORAGE_KEY,
    default_value: DURATION_FORMAT_DEFAULT,
    is_valid: is_duration_format,
  })
