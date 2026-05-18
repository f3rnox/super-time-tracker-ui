'use client'

import { type FormEvent, useState } from 'react'

interface NoteFormProps {
  on_submit: (text: string) => void
  is_pending: boolean
}

/**
 * Adds a note to the active entry.
 */
export function NoteForm({ on_submit, is_pending }: NoteFormProps) {
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

  return (
    <form className="note-form" onSubmit={handle_submit}>
      <label className="note-form__label" htmlFor="note-text">
        Add note
      </label>
      <div className="note-form__row">
        <input
          id="note-text"
          className="input"
          value={text}
          onChange={(event) => set_text(event.target.value)}
          placeholder="Pair with alice on the widget"
          disabled={is_pending}
        />
        <button
          type="submit"
          className="button button--ghost"
          disabled={is_pending || text.trim().length === 0}
        >
          Save note
        </button>
      </div>
    </form>
  )
}
