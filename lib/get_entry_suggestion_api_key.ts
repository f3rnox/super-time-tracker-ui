import { type EntrySuggestionProvider } from "@/lib/types/ui_preferences";

/**
 * Resolves the API key for the selected entry description suggestion provider.
 */
export function get_entry_suggestion_api_key(
  provider: EntrySuggestionProvider,
  openai_api_key: string,
  claude_api_key: string,
  google_ai_api_key: string,
): string {
  if (provider === "openai") {
    return openai_api_key;
  }

  if (provider === "claude") {
    return claude_api_key;
  }

  if (provider === "google_ai") {
    return google_ai_api_key;
  }

  return "";
}
