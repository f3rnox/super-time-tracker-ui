import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  CONFIRM_DESTRUCTIVE_ACTIONS_DEFAULT,
  CONFIRM_DESTRUCTIVE_ACTIONS_STORAGE_KEY,
  type ConfirmDestructiveActions,
} from '@/lib/types/ui_preferences'

const is_confirm_destructive_actions = (
  value: string,
): value is ConfirmDestructiveActions => value === 'true' || value === 'false'

/**
 * Whether to show a confirm dialog before deleting entries or sheets.
 */
export const confirm_destructive_actions_preference =
  create_ui_preference_store<ConfirmDestructiveActions>({
    storage_key: CONFIRM_DESTRUCTIVE_ACTIONS_STORAGE_KEY,
    default_value: CONFIRM_DESTRUCTIVE_ACTIONS_DEFAULT,
    is_valid: is_confirm_destructive_actions,
  })
