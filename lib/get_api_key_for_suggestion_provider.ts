import { type EntrySuggestionProvider } from "@/lib/types/ui_preferences";

/**
 * Returns the API key stored for the given AI suggestion provider.
 */
export function get_api_key_for_suggestion_provider(
  provider: EntrySuggestionProvider,
  keys: {
    openai: string;
    claude: string;
    google_ai: string;
  },
): string {
  if (provider === "openai") {
    return keys.openai;
  }

  if (provider === "claude") {
    return keys.claude;
  }

  if (provider === "google_ai") {
    return keys.google_ai;
  }

  return "";
}
