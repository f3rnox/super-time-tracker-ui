'use client'

import { type EntrySuggestionProvider } from '@/lib/types/ui_preferences'

interface RequestAiEntryDescriptionSuggestionArgs {
  provider: EntrySuggestionProvider
  api_key: string
  context: string
  notes: string
}

/**
 * Requests an AI-suggested entry description using the configured provider.
 */
export async function request_ai_entry_description_suggestion(
  args: RequestAiEntryDescriptionSuggestionArgs,
): Promise<string> {
  if (args.provider === 'none') {
    throw new Error('AI suggestion provider is disabled')
  }

  const response = await fetch('/api/entry/suggest-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: args.provider,
      api_key: args.api_key,
      context: args.context,
      notes: args.notes,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Failed to suggest description')
  }

  const body = (await response.json()) as { description?: string }
  const description = body.description?.trim() ?? ''

  if (description.length === 0) {
    throw new Error('Suggestion was empty')
  }

  return description
}
