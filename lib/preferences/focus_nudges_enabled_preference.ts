import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  FOCUS_NUDGES_ENABLED_DEFAULT,
  FOCUS_NUDGES_ENABLED_STORAGE_KEY,
  type FocusNudgesEnabled,
} from '@/lib/types/ui_preferences'

const is_focus_nudges_enabled = (value: string): value is FocusNudgesEnabled =>
  value === 'true' || value === 'false'

/**
 * Whether focus goals and nudges are active in the tracker UI.
 */
export const focus_nudges_enabled_preference =
  create_ui_preference_store<FocusNudgesEnabled>({
    storage_key: FOCUS_NUDGES_ENABLED_STORAGE_KEY,
    default_value: FOCUS_NUDGES_ENABLED_DEFAULT,
    is_valid: is_focus_nudges_enabled,
  })
