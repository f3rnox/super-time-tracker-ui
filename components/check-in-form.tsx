'use client'

import { type FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { TagAutocompleteInput } from '@/components/tag-autocomplete-input'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { claude_api_key_preference } from '@/lib/preferences/claude_api_key_preference'
import { entry_suggestion_provider_preference } from '@/lib/preferences/entry_suggestion_provider_preference'
import { google_ai_api_key_preference } from '@/lib/preferences/google_ai_api_key_preference'
import { openai_api_key_preference } from '@/lib/preferences/openai_api_key_preference'
import { read_entry_templates } from '@/lib/read_entry_templates'
import { request_ai_entry_description_suggestion } from '@/lib/request_ai_entry_description_suggestion'
import { type EntryTemplate } from '@/lib/types/entry_template'
import { write_entry_templates } from '@/lib/write_entry_templates'

export interface CheckInFormValues {
  description: string
  at?: string
}

interface CheckInFormProps {
  known_tags: string[]
  on_submit: (values: CheckInFormValues) => void
  is_pending: boolean
}

/**
 * Form for starting a new time sheet entry.
 */
export function CheckInForm({
  known_tags,
  on_submit,
  is_pending,
}: CheckInFormProps) {
  const [templates, set_templates] = useState<EntryTemplate[]>([])
  const [selected_template_id, set_selected_template_id] = useState('')
  const [description, set_description] = useState('')
  const [at, set_at] = useState('')
  const [suggestion_error, set_suggestion_error] = useState<string | null>(null)
  const [is_suggestion_pending, set_is_suggestion_pending] = useState(false)
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
    set_templates(read_entry_templates())
  }, [])

  const selected_template = useMemo(
    () => templates.find((template) => template.id === selected_template_id) ?? null,
    [templates, selected_template_id],
  )

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed_description = description.trim()

    if (trimmed_description.length === 0) {
      return
    }

    const trimmed_at = at.trim()

    on_submit({
      description: trimmed_description,
      ...(trimmed_at.length > 0 ? { at: trimmed_at } : {}),
    })
    set_description('')
    set_at('')
  }

  const save_template = (): void => {
    const template_description = description.trim()

    if (template_description.length === 0) {
      return
    }

    const default_name = template_description.slice(0, 40)
    const name_input = window.prompt(
      'Template name',
      default_name.length > 0 ? default_name : 'New template',
    )

    if (name_input === null) {
      return
    }

    const template_name = name_input.trim()

    if (template_name.length === 0) {
      return
    }

    const template_id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const next_templates = [
      ...templates,
      {
        id: template_id,
        name: template_name,
        description: template_description,
      },
    ]

    set_templates(next_templates)
    set_selected_template_id(template_id)
    write_entry_templates(next_templates)
  }

  const delete_selected_template = (): void => {
    if (selected_template === null) {
      return
    }

    const next_templates = templates.filter(
      (template) => template.id !== selected_template.id,
    )
    set_templates(next_templates)
    set_selected_template_id('')
    write_entry_templates(next_templates)
  }

  const suggest_description = async (): Promise<void> => {
    if (!can_suggest) {
      return
    }

    set_is_suggestion_pending(true)
    set_suggestion_error(null)

    try {
      const next_description = await request_ai_entry_description_suggestion({
        provider: suggestion_provider,
        api_key: selected_api_key,
        context: description,
        notes: '',
      })

      set_description(next_description)
    } catch (error: unknown) {
      set_suggestion_error(error instanceof Error ? error.message : String(error))
    } finally {
      set_is_suggestion_pending(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-2 border border-panel-border bg-panel p-[1.1rem] shadow-sm"
      onSubmit={handle_submit}
    >
      <label className="text-[0.85rem] text-muted" htmlFor="check-in-description">
        What are you working on?
      </label>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <select
          className={get_input_class_name()}
          value={selected_template_id}
          disabled={is_pending || templates.length === 0}
          onChange={(event) => {
            const next_template_id = event.target.value
            set_selected_template_id(next_template_id)

            const next_template =
              templates.find((template) => template.id === next_template_id) ?? null
            if (next_template !== null) {
              set_description(next_template.description)
            }
          }}
        >
          <option value="">
            {templates.length === 0 ? 'No templates' : 'Use a template…'}
          </option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={get_button_class_name('ghost')}
          disabled={is_pending || description.trim().length === 0}
          onClick={save_template}
        >
          Save template
        </button>
        <button
          type="button"
          className={get_button_class_name('ghost')}
          disabled={is_pending || selected_template === null}
          onClick={delete_selected_template}
        >
          Delete template
        </button>
      </div>
      <div
        className={`grid gap-2 max-[860px]:grid-cols-1 ${
          can_suggest
            ? 'grid-cols-[minmax(0,1fr)_auto_auto]'
            : 'grid-cols-[minmax(0,1fr)_auto]'
        }`}
      >
        <TagAutocompleteInput
          id="check-in-description"
          value={description}
          known_tags={known_tags}
          placeholder="e.g. crafting something @design"
          disabled={is_pending}
          autoFocus
          on_change={set_description}
        />
        {can_suggest ? (
          <button
            type="button"
            className={get_button_class_name('ghost')}
            disabled={is_pending || is_suggestion_pending}
            onClick={() => void suggest_description()}
            title="Suggest description with AI"
          >
            {is_suggestion_pending ? 'Suggesting…' : 'Suggest'}
          </button>
        ) : null}
        <button
          type="submit"
          className={get_button_class_name('primary')}
          disabled={is_pending || description.trim().length === 0}
        >
          Check in
        </button>
      </div>
      {suggestion_error !== null ? (
        <p className="m-0 text-[0.8rem] text-danger">{suggestion_error}</p>
      ) : null}
      <label className="text-[0.85rem] text-muted" htmlFor="check-in-at">
        Start time{' '}
        <span className="font-normal opacity-85">(optional, natural language)</span>
      </label>
      <input
        id="check-in-at"
        className={get_input_class_name()}
        value={at}
        onChange={(event) => set_at(event.target.value)}
        placeholder="e.g. 30 minutes ago"
        disabled={is_pending}
      />
    </form>
  )
}
