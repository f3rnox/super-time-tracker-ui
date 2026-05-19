'use client'

import { type FormEvent, useState } from 'react'

import { TagAutocompleteInput } from '@/components/tag-autocomplete-input'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'

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
  const [description, set_description] = useState('')
  const [at, set_at] = useState('')

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

  return (
    <form
      className="flex flex-col gap-2 border border-panel-border bg-panel p-[1.1rem] shadow-sm"
      onSubmit={handle_submit}
    >
      <label className="text-[0.85rem] text-muted" htmlFor="check-in-description">
        What are you working on?
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-[860px]:grid-cols-1">
        <TagAutocompleteInput
          id="check-in-description"
          value={description}
          known_tags={known_tags}
          placeholder="e.g. crafting something @design"
          disabled={is_pending}
          autoFocus
          on_change={set_description}
        />
        <button
          type="submit"
          className={get_button_class_name('primary')}
          disabled={is_pending || description.trim().length === 0}
        >
          Check in
        </button>
      </div>
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
