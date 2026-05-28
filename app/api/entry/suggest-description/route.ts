import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";

type SuggestionProvider = "openai" | "claude" | "google_ai";

interface SuggestDescriptionBody {
  provider?: SuggestionProvider;
  api_key?: string;
  context?: string;
  notes?: string;
  debug_logging?: boolean;
}

const normalize_suggestion = (value: string): string => {
  const single_line = value.replace(/\s+/g, " ").trim();
  const without_wrapping_quotes = single_line
    .replace(/^["'`]|["'`]$/g, "")
    .trim();
  return without_wrapping_quotes;
};

const build_user_prompt = (context: string, notes: string): string => {
  const trimmed_context = context.trim();
  const trimmed_notes = notes.trim();

  if (trimmed_context.length === 0 && trimmed_notes.length === 0) {
    return "Generate one time-tracking entry description with optional @tags.";
  }

  if (trimmed_context.length > 0 && trimmed_notes.length === 0) {
    return `Current description: "${trimmed_context}". Revise it into one time-tracking entry description. Preserve and incorporate all meaningful details from the current description in the revised text. Keep inline @tags if relevant.`;
  }

  if (trimmed_context.length === 0 && trimmed_notes.length > 0) {
    return `Notes: "${trimmed_notes}". Generate one time-tracking entry description that includes all meaningful details from the notes, with optional inline @tags.`;
  }

  return `Current description: "${trimmed_context}". Notes: "${trimmed_notes}". Revise into one time-tracking entry description that preserves and incorporates all meaningful details from both the current description and all notes. Keep inline @tags if relevant.`;
};

const suggest_with_openai = async (
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You generate one time-tracking entry description. Output plain text only, no markdown, no quotes, one line.",
        },
        {
          role: "user",
          content: build_user_prompt(context, notes),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? "OpenAI suggestion request failed");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? "";

  if (content.trim().length === 0) {
    throw new Error("OpenAI returned an empty suggestion");
  }

  return normalize_suggestion(content);
};

const suggest_with_claude = async (
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": api_key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      temperature: 0.5,
      max_tokens: 400,
      system:
        "You generate one time-tracking entry description. Output plain text only, no markdown, no quotes, one line.",
      messages: [
        {
          role: "user",
          content: build_user_prompt(context, notes),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? "Claude suggestion request failed");
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const content =
    payload.content?.find((item) => item.type === "text")?.text ?? "";

  if (content.trim().length === 0) {
    throw new Error("Claude returned an empty suggestion");
  }

  return normalize_suggestion(content);
};

const suggest_with_google_ai = async (
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(api_key)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 400,
        },
        systemInstruction: {
          parts: [
            {
              text: "You generate one time-tracking entry description. Output plain text only, no markdown, no quotes, one line.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: build_user_prompt(context, notes) }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(
      body.error?.message ?? "Google AI suggestion request failed",
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content_parts = payload.candidates?.[0]?.content?.parts ?? [];
  const content = content_parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (content.trim().length === 0) {
    throw new Error("Google AI returned an empty suggestion");
  }

  const suggestion = normalize_suggestion(content);

  if (suggestion.length < 6) {
    throw new Error("Google AI returned a too-short suggestion");
  }

  return suggestion;
};

const is_supported_provider = (
  provider: SuggestionProvider | undefined,
): provider is SuggestionProvider =>
  provider === "openai" || provider === "claude" || provider === "google_ai";

const get_suggestion_model = (provider: SuggestionProvider): string => {
  if (provider === "openai") {
    return "gpt-4o-mini";
  }

  if (provider === "claude") {
    return "claude-3-5-haiku-latest";
  }

  return "gemini-2.5-flash";
};

const suggest_for_provider = async (
  provider: SuggestionProvider,
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  if (provider === "openai") {
    return suggest_with_openai(api_key, context, notes);
  }

  if (provider === "claude") {
    return suggest_with_claude(api_key, context, notes);
  }

  return suggest_with_google_ai(api_key, context, notes);
};

const log_debug_suggestion_request = (
  provider: SuggestionProvider,
  context: string,
  notes: string,
): void => {
  const user_message = build_user_prompt(context, notes);
  const system_message =
    "You generate one time-tracking entry description. Output plain text only, no markdown, no quotes, one line.";

  console.info("[ai-suggestion] server request received", {
    provider,
    context_length: context.length,
    notes_length: notes.length,
  });
  console.info("[ai-suggestion] outgoing model query", {
    provider,
    model: get_suggestion_model(provider),
    sent_message: {
      system_message,
      user_message,
    },
    query: user_message,
    context,
    notes,
  });
};

/**
 * Suggests an entry description via the selected LLM provider.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const started_at = Date.now();
  let debug_logging = false;

  try {
    const body = (await request.json()) as SuggestDescriptionBody;
    const provider = body.provider;
    const api_key = body.api_key?.trim() ?? "";
    const context = body.context ?? "";
    const notes = body.notes ?? "";
    debug_logging = body.debug_logging === true;

    if (!is_supported_provider(provider)) {
      return api_error_response(
        new Error("Unsupported suggestion provider"),
        400,
      );
    }

    if (api_key.length === 0) {
      return api_error_response(new Error("API key is required"), 400);
    }

    if (debug_logging) {
      log_debug_suggestion_request(provider, context, notes);
    }

    const description = await suggest_for_provider(
      provider,
      api_key,
      context,
      notes,
    );

    if (debug_logging) {
      console.info("[ai-suggestion] server request success", {
        provider,
        elapsed_ms: Date.now() - started_at,
        description_length: description.length,
      });
    }

    return NextResponse.json({ description });
  } catch (error: unknown) {
    if (debug_logging) {
      console.error("[ai-suggestion] server request error", {
        elapsed_ms: Date.now() - started_at,
        error: message_from_unknown_error(error, "Suggestion request failed"),
      });
    }
    return api_error_response(error, 500);
  }
}
