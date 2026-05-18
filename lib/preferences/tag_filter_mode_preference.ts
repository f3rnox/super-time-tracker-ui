import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  TAG_FILTER_MODE_DEFAULT,
  TAG_FILTER_MODE_STORAGE_KEY,
  type TagFilterMode,
} from '@/lib/types/ui_preferences'

const is_tag_filter_mode = (value: string): value is TagFilterMode =>
  value === 'all' || value === 'any'

/**
 * Tag filter match mode: require all selected tags or any one.
 */
export const tag_filter_mode_preference = create_ui_preference_store<TagFilterMode>({
  storage_key: TAG_FILTER_MODE_STORAGE_KEY,
  default_value: TAG_FILTER_MODE_DEFAULT,
  is_valid: is_tag_filter_mode,
})
