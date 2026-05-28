import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  DEBUG_LOGGING_DEFAULT,
  DEBUG_LOGGING_STORAGE_KEY,
  type DebugLogging,
} from '@/lib/types/ui_preferences'

const is_debug_logging = (value: string): value is DebugLogging =>
  value === 'true' || value === 'false'

/**
 * Enables verbose debug logs for troubleshooting.
 */
export const debug_logging_preference = create_ui_preference_store<DebugLogging>({
  storage_key: DEBUG_LOGGING_STORAGE_KEY,
  default_value: DEBUG_LOGGING_DEFAULT,
  is_valid: is_debug_logging,
})
