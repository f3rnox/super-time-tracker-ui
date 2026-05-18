import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  CHECK_IN_FORM_COLLAPSED_DEFAULT,
  CHECK_IN_FORM_COLLAPSED_STORAGE_KEY,
  type CheckInFormCollapsed,
} from '@/lib/types/ui_preferences'

const is_check_in_form_collapsed = (
  value: string,
): value is CheckInFormCollapsed => value === 'true' || value === 'false'

/**
 * Whether the check-in form should be collapsed by default.
 */
export const check_in_form_collapsed_preference =
  create_ui_preference_store<CheckInFormCollapsed>({
    storage_key: CHECK_IN_FORM_COLLAPSED_STORAGE_KEY,
    default_value: CHECK_IN_FORM_COLLAPSED_DEFAULT,
    is_valid: is_check_in_form_collapsed,
  })
