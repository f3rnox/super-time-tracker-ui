'use client'

import { type FormEvent, useState } from 'react'

interface NoteEditFormProps {
  initial_text: string
  is_pending: boolean
  on_save: (text: string) => void
  on_cancel: () => void
}

/**
 * Inline form for editing an existing entry note.
 */
export function NoteEditForm({
  initial_text,
  is_pending,
  on_save,
  on_cancel,
}: NoteEditFormProps) {
  const [text, set_text] = useState(initial_text)
  const line_count = initial_text.split('\n').length
  const rows = Math.min(6, Math.max(2, line_count))

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = text.trim()

    if (trimmed.length === 0) {
      return
    }

    on_save(trimmed)
  }

  return (
    <form
      className="note-edit-form"
      onSubmit={handle_submit}
      onClick={(event) => event.stopPropagation()}
    >
      <textarea
        className="input note-edit-form__input"
        value={text}
        rows={rows}
        disabled={is_pending}
        onChange={(event) => set_text(event.target.value)}
      />
      <div className="note-edit-form__actions">
        <button
          type="button"
          className="button button--ghost"
          disabled={is_pending}
          onClick={on_cancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button button--ghost"
          disabled={is_pending || text.trim().length === 0}
        >
          Save
        </button>
      </div>
    </form>
  )
}
