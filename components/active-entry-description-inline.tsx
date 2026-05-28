'use client'

import { type FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { AiSparklesIcon } from '@/components/ai-sparkles-icon'
import { TagAutocompleteInput } from '@/components/tag-autocomplete-input'
import { build_resume_description } from '@/lib/build_resume_description'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { claude_api_key_preference } from '@/lib/preferences/claude_api_key_preference'
import { entry_suggestion_provider_preference } from '@/lib/preferences/entry_suggestion_provider_preference'
import { google_ai_api_key_preference } from '@/lib/preferences/google_ai_api_key_preference'
import { openai_api_key_preference } from '@/lib/preferences/openai_api_key_preference'
import { request_ai_entry_description_suggestion } from '@/lib/request_ai_entry_description_suggestion'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface ActiveEntryDescriptionInlineProps {
  entry: SerializedEntry
  known_tags: string[]
  is_pending: boolean
  on_save: (description: string) => void
  on_cancel: () => void
}

/**
 * Inline description editor for the active entry panel heading.
 */
export function ActiveEntryDescriptionInline({
  entry,
  known_tags,
  is_pending,
  on_save,
  on_cancel,
}: ActiveEntryDescriptionInlineProps) {
  const initial_description = useMemo(
    () => build_resume_description(entry.description, entry.tags),
    [entry.description, entry.id, entry.tags],
  )
  const [description, set_description] = useState(initial_description)
  const [is_suggestion_pending, set_is_suggestion_pending] = useState(false)
  const [suggestion_error, set_suggestion_error] = useState<string | null>(null)
  const suggestion_provider = useSyncExternalStore(
    entry_suggestion_provider_preference.subscribe,
    entry_suggestion_provider_preference.get_snapshot,
    entry_suggestion_provider_preference.get_server_snapshot,
  )
  const openai_api_key = useSyncExternalStore(
    openai_api_key_preference.subscribe,
    openai_api_key_preference.get_snapshot,
    openai_api_key_preference.get_server_snapshot,
  )
  const claude_api_key = useSyncExternalStore(
    claude_api_key_preference.subscribe,
    claude_api_key_preference.get_snapshot,
    claude_api_key_preference.get_server_snapshot,
  )
  const google_ai_api_key = useSyncExternalStore(
    google_ai_api_key_preference.subscribe,
    google_ai_api_key_preference.get_snapshot,
    google_ai_api_key_preference.get_server_snapshot,
  )
  const selected_api_key =
    suggestion_provider === 'openai'
      ? openai_api_key
      : suggestion_provider === 'claude'
        ? claude_api_key
        : suggestion_provider === 'google_ai'
          ? google_ai_api_key
        : ''
  const can_suggest =
    suggestion_provider !== 'none' && selected_api_key.trim().length > 0

  useEffect(() => {
    set_description(build_resume_description(entry.description, entry.tags))
  }, [entry.description, entry.id, entry.sheetName, entry.tags])

  use_escape_to_cancel(on_cancel)

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = description.trim()

    if (trimmed === initial_description.trim()) {
      on_cancel()
      return
    }

    on_save(trimmed)
  }

  const handle_suggest = async (): Promise<void> => {
    if (!can_suggest) {
      return
    }

    set_is_suggestion_pending(true)
    set_suggestion_error(null)

    try {
      const notes_context = entry.notes.map((note) => note.text).join('\n')
      const suggestion = await request_ai_entry_description_suggestion({
        provider: suggestion_provider,
        api_key: selected_api_key,
        context: description,
        notes: notes_context,
      })
      set_description(suggestion)
    } catch (error: unknown) {
      set_suggestion_error(error instanceof Error ? error.message : String(error))
    } finally {
      set_is_suggestion_pending(false)
    }
  }

  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-2"
      onSubmit={handle_submit}
    >
      <div className="flex min-w-0 items-start gap-2 max-[700px]:flex-col">
        <div className="min-w-0 flex-1">
          <TagAutocompleteInput
            id={`active-entry-description-${entry.id}`}
            value={description}
            known_tags={known_tags}
            placeholder="e.g. crafting something @design"
            disabled={is_pending}
            autoFocus
            on_change={set_description}
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 max-[700px]:w-full">
          {can_suggest ? (
            <button
              type="button"
              className={get_button_class_name('ghost', 'small')}
              disabled={is_pending || is_suggestion_pending}
              title="Revise description with AI"
              aria-label="Revise description with AI"
              onClick={() => void handle_suggest()}
            >
              <span className="inline-flex items-center gap-1.5">
                <AiSparklesIcon />
                {is_suggestion_pending ? 'Revising…' : 'Revise with AI'}
              </span>
            </button>
          ) : null}
          <button
            type="submit"
            className={get_button_class_name('primary', 'small')}
            disabled={is_pending || description.trim() === initial_description.trim()}
          >
            Save
          </button>
          <button
            type="button"
            className={get_button_class_name('ghost', 'small')}
            disabled={is_pending}
            onClick={on_cancel}
          >
            Cancel
          </button>
        </div>
      </div>
      {suggestion_error !== null ? (
        <p className="m-0 text-[0.8rem] text-danger">{suggestion_error}</p>
      ) : null}
    </form>
  )
}
