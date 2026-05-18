'use client'

import { type FormEvent, useState } from 'react'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'

interface NoteFormProps {
  on_submit: (text: string) => void
  is_pending: boolean
  in_active_panel?: boolean
  in_bar?: boolean
}

/**
 * Adds a note to the active entry.
 */
export function NoteForm({
  on_submit,
  is_pending,
  in_active_panel = false,
  in_bar = false,
}: NoteFormProps) {
  const [text, set_text] = useState('')

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = text.trim()

    if (trimmed.length === 0) {
      return
    }

    on_submit(trimmed)
    set_text('')
  }

  const border_class =
    in_active_panel && !in_bar
      ? 'border-t border-accent-border pt-4'
      : in_bar
        ? 'border-t border-[color-mix(in_srgb,var(--accent-border)_65%,var(--panel-border))] pt-3.5'
        : ''

  return (
    <form
      className={`flex flex-col gap-2 ${border_class}`}
      onSubmit={handle_submit}
    >
      <label className="text-[0.85rem] text-muted" htmlFor="note-text">
        Add note
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-[860px]:grid-cols-1">
        <input
          id="note-text"
          className={get_input_class_name()}
          value={text}
          onChange={(event) => set_text(event.target.value)}
          placeholder="Pair with alice on the widget"
          disabled={is_pending}
        />
        <button
          type="submit"
          className={get_button_class_name('ghost')}
          disabled={is_pending || text.trim().length === 0}
        >
          Save note
        </button>
      </div>
    </form>
  )
}
