"use client";

import { debug_logging_preference } from "@/lib/preferences/debug_logging_preference";
import { type EntrySuggestionProvider } from "@/lib/types/ui_preferences";

interface RequestAiEntryDescriptionSuggestionArgs {
  provider: EntrySuggestionProvider;
  api_key: string;
  context: string;
  notes: string;
}

/**
 * Requests an AI-suggested entry description using the configured provider.
 */
export async function request_ai_entry_description_suggestion(
  args: RequestAiEntryDescriptionSuggestionArgs,
): Promise<string> {
  if (args.provider === "none") {
    throw new Error("AI suggestion provider is disabled");
  }

  const debug_logging = debug_logging_preference.read() === "true";
  const started_at = Date.now();
  const request_payload = {
    provider: args.provider,
    context: args.context,
    notes: args.notes,
    debug_logging,
  };

  if (debug_logging) {
    console.info("[ai-suggestion] client request start", {
      provider: args.provider,
      context_length: args.context.length,
      notes_length: args.notes.length,
    });
  }

  try {
    const response = await fetch("/api/entry/suggest-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...request_payload,
        api_key: args.api_key,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (debug_logging) {
        console.warn("[ai-suggestion] client request failed", {
          provider: args.provider,
          status: response.status,
          elapsed_ms: Date.now() - started_at,
          error: body.error ?? "Failed to suggest description",
        });
      }

      throw new Error(body.error ?? "Failed to suggest description");
    }

    const body = (await response.json()) as { description?: string };
    const description = body.description?.trim() ?? "";

    if (description.length === 0) {
      throw new Error("Suggestion was empty");
    }

    if (debug_logging) {
      console.info("[ai-suggestion] client request success", {
        provider: args.provider,
        elapsed_ms: Date.now() - started_at,
        description_length: description.length,
      });
    }

    return description;
  } catch (error: unknown) {
    if (debug_logging) {
      console.error("[ai-suggestion] client request error", {
        provider: args.provider,
        elapsed_ms: Date.now() - started_at,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}
