import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  TODAY_FOCUS_SCOPE_DEFAULT,
  TODAY_FOCUS_SCOPE_STORAGE_KEY,
  type TodayFocusScope,
} from '@/lib/types/today_focus_preferences'

const scope_values: TodayFocusScope[] = ['all', 'pinned']

const is_valid_today_focus_scope = (
  value: string,
): value is TodayFocusScope => scope_values.includes(value as TodayFocusScope)

/**
 * Today view scope preference: all sheets or pinned sheets only.
 */
export const today_scope_preference = create_ui_preference_store<TodayFocusScope>({
  storage_key: TODAY_FOCUS_SCOPE_STORAGE_KEY,
  default_value: TODAY_FOCUS_SCOPE_DEFAULT,
  is_valid: is_valid_today_focus_scope,
})
