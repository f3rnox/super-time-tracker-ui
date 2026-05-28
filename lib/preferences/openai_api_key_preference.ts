import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  OPENAI_API_KEY_DEFAULT,
  OPENAI_API_KEY_STORAGE_KEY,
  type OpenAiApiKey,
} from '@/lib/types/ui_preferences'

const is_openai_api_key = (value: string): value is OpenAiApiKey =>
  value.trim().length > 0

/**
 * Local OpenAI API key used for entry suggestion calls.
 */
export const openai_api_key_preference = create_ui_preference_store<OpenAiApiKey>({
  storage_key: OPENAI_API_KEY_STORAGE_KEY,
  default_value: OPENAI_API_KEY_DEFAULT,
  is_valid: is_openai_api_key,
})
