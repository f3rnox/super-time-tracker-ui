import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  TIMER_IN_TITLE_DEFAULT,
  TIMER_IN_TITLE_STORAGE_KEY,
  type TimerInTitle,
} from '@/lib/types/ui_preferences'

const is_timer_in_title = (value: string): value is TimerInTitle =>
  value === 'true' || value === 'false'

/**
 * Whether the browser tab title shows the live timer while tracking.
 */
export const timer_in_title_preference = create_ui_preference_store<TimerInTitle>({
  storage_key: TIMER_IN_TITLE_STORAGE_KEY,
  default_value: TIMER_IN_TITLE_DEFAULT,
  is_valid: is_timer_in_title,
})
