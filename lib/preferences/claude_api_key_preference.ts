import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  CLAUDE_API_KEY_DEFAULT,
  CLAUDE_API_KEY_STORAGE_KEY,
  type ClaudeApiKey,
} from "@/lib/types/ui_preferences";

const is_claude_api_key = (value: string): value is ClaudeApiKey =>
  value.trim().length > 0;

/**
 * Local Claude API key used for entry suggestion calls.
 */
export const claude_api_key_preference =
  create_ui_preference_store<ClaudeApiKey>({
    storage_key: CLAUDE_API_KEY_STORAGE_KEY,
    default_value: CLAUDE_API_KEY_DEFAULT,
    is_valid: is_claude_api_key,
  });
