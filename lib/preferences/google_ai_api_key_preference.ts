import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  GOOGLE_AI_API_KEY_DEFAULT,
  GOOGLE_AI_API_KEY_STORAGE_KEY,
  type GoogleAiApiKey,
} from "@/lib/types/ui_preferences";

const is_google_ai_api_key = (value: string): value is GoogleAiApiKey =>
  value.trim().length > 0;

/**
 * Local Google AI API key used for entry suggestion calls.
 */
export const google_ai_api_key_preference =
  create_ui_preference_store<GoogleAiApiKey>({
    storage_key: GOOGLE_AI_API_KEY_STORAGE_KEY,
    default_value: GOOGLE_AI_API_KEY_DEFAULT,
    is_valid: is_google_ai_api_key,
  });
