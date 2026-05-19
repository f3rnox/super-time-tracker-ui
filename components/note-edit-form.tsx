'use client'

import { type FormEvent, useState } from 'react'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'

interface NoteEditFormProps {
  initial_text: string
  is_pending: boolean
  inline?: boolean
  on_save: (text: string) => void
  on_cancel: () => void
}

/**
 * Inline form for editing an existing entry note.
 */
export function NoteEditForm({
  initial_text,
  is_pending,
  inline = false,
  on_save,
  on_cancel,
}: NoteEditFormProps) {
  const [text, set_text] = useState(initial_text)

  use_escape_to_cancel(on_cancel)

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

  const textarea_class = inline
    ? `${get_input_class_name()} min-h-10 w-full resize-y text-xs leading-snug`
    : `${get_input_class_name()} min-h-10 w-full resize-y text-[0.85rem] leading-snug`

  return (
    <form
      className="flex w-full flex-col gap-1.5"
      onSubmit={handle_submit}
      onClick={(event) => event.stopPropagation()}
    >
      <textarea
        className={textarea_class}
        value={text}
        rows={rows}
        disabled={is_pending}
        onChange={(event) => set_text(event.target.value)}
      />
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          className={get_button_class_name('ghost')}
          disabled={is_pending}
          onClick={on_cancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={get_button_class_name('ghost')}
          disabled={is_pending || text.trim().length === 0}
        >
          Save
        </button>
      </div>
    </form>
  )
}
