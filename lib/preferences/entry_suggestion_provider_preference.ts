import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  ENTRY_SUGGESTION_PROVIDER_DEFAULT,
  ENTRY_SUGGESTION_PROVIDER_STORAGE_KEY,
  type EntrySuggestionProvider,
} from '@/lib/types/ui_preferences'

const is_entry_suggestion_provider = (
  value: string,
): value is EntrySuggestionProvider =>
  value === 'none' || value === 'openai' || value === 'claude' || value === 'google_ai'

/**
 * Selected LLM provider for entry description suggestions.
 */
export const entry_suggestion_provider_preference =
  create_ui_preference_store<EntrySuggestionProvider>({
    storage_key: ENTRY_SUGGESTION_PROVIDER_STORAGE_KEY,
    default_value: ENTRY_SUGGESTION_PROVIDER_DEFAULT,
    is_valid: is_entry_suggestion_provider,
  })
