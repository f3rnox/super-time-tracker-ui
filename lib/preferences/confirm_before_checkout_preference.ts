import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  CONFIRM_BEFORE_CHECKOUT_DEFAULT,
  CONFIRM_BEFORE_CHECKOUT_STORAGE_KEY,
  type ConfirmBeforeCheckout,
} from '@/lib/types/ui_preferences'

const is_confirm_before_checkout = (
  value: string,
): value is ConfirmBeforeCheckout => value === 'true' || value === 'false'

/**
 * Whether to confirm before checking out of an active timer.
 */
export const confirm_before_checkout_preference =
  create_ui_preference_store<ConfirmBeforeCheckout>({
    storage_key: CONFIRM_BEFORE_CHECKOUT_STORAGE_KEY,
    default_value: CONFIRM_BEFORE_CHECKOUT_DEFAULT,
    is_valid: is_confirm_before_checkout,
  })
