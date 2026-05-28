import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'

type SuggestionProvider = 'openai' | 'claude' | 'google_ai'

interface SuggestDescriptionBody {
  provider?: SuggestionProvider
  api_key?: string
  context?: string
  notes?: string
}

const normalize_suggestion = (value: string): string => {
  const single_line = value.replace(/\s+/g, ' ').trim()
  const without_wrapping_quotes = single_line.replace(/^["'`]|["'`]$/g, '').trim()

  if (without_wrapping_quotes.length <= 140) {
    return without_wrapping_quotes
  }

  return without_wrapping_quotes.slice(0, 140).trim()
}

const build_user_prompt = (context: string, notes: string): string => {
  const trimmed_context = context.trim()
  const trimmed_notes = notes.trim()

  if (trimmed_context.length === 0 && trimmed_notes.length === 0) {
    return 'Generate one concise time-tracking entry description with optional @tags.'
  }

  if (trimmed_context.length > 0 && trimmed_notes.length === 0) {
    return `Current draft: "${trimmed_context}". Improve it into one concise time-tracking entry description. Keep inline @tags if relevant.`
  }

  if (trimmed_context.length === 0 && trimmed_notes.length > 0) {
    return `Notes: "${trimmed_notes}". Generate one concise time-tracking entry description with optional inline @tags.`
  }

  return `Current draft: "${trimmed_context}". Notes: "${trimmed_notes}". Improve the draft into one concise time-tracking entry description and use notes as context. Keep inline @tags if relevant.`
}

const suggest_with_openai = async (
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 80,
      messages: [
        {
          role: 'system',
          content:
            'You generate one short time-tracking entry description. Output plain text only, no markdown, no quotes, one line.',
        },
        {
          role: 'user',
          content: build_user_prompt(context, notes),
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(body.error?.message ?? 'OpenAI suggestion request failed')
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = payload.choices?.[0]?.message?.content ?? ''

  if (content.trim().length === 0) {
    throw new Error('OpenAI returned an empty suggestion')
  }

  return normalize_suggestion(content)
}

const suggest_with_claude = async (
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': api_key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      temperature: 0.5,
      max_tokens: 80,
      system:
        'You generate one short time-tracking entry description. Output plain text only, no markdown, no quotes, one line.',
      messages: [
        {
          role: 'user',
          content: build_user_prompt(context, notes),
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(body.error?.message ?? 'Claude suggestion request failed')
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>
  }
  const content = payload.content?.find((item) => item.type === 'text')?.text ?? ''

  if (content.trim().length === 0) {
    throw new Error('Claude returned an empty suggestion')
  }

  return normalize_suggestion(content)
}

const suggest_with_google_ai = async (
  api_key: string,
  context: string,
  notes: string,
): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(api_key)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 80,
        },
        systemInstruction: {
          parts: [
            {
              text: 'You generate one short time-tracking entry description. Output plain text only, no markdown, no quotes, one line.',
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: build_user_prompt(context, notes) }],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string }
    }
    throw new Error(body.error?.message ?? 'Google AI suggestion request failed')
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const content =
    payload.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === 'string')
      ?.text ?? ''

  if (content.trim().length === 0) {
    throw new Error('Google AI returned an empty suggestion')
  }

  return normalize_suggestion(content)
}

/**
 * Suggests a concise entry description via the selected LLM provider.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SuggestDescriptionBody
    const provider = body.provider
    const api_key = body.api_key?.trim() ?? ''
    const context = body.context ?? ''
    const notes = body.notes ?? ''

    if (provider !== 'openai' && provider !== 'claude' && provider !== 'google_ai') {
      return api_error_response(new Error('Unsupported suggestion provider'), 400)
    }

    if (api_key.length === 0) {
      return api_error_response(new Error('API key is required'), 400)
    }

    const description =
      provider === 'openai'
        ? await suggest_with_openai(api_key, context, notes)
        : provider === 'claude'
          ? await suggest_with_claude(api_key, context, notes)
          : await suggest_with_google_ai(api_key, context, notes)

    return NextResponse.json({ description })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}
