'use client'

import { type FormEvent, useState } from 'react'

import { format_datetime_hint } from '@/components/format_datetime_hint'
import { type SerializedEntry } from '@/lib/types/tracker_state'

export interface EntryEditFormValues {
  start?: string
  end?: string
}

interface EntryEditFormProps {
  entry: SerializedEntry
  is_pending: boolean
  on_save: (values: EntryEditFormValues) => void
  on_cancel: () => void
}

/**
 * Form for editing an entry's start and end times with natural language.
 */
export function EntryEditForm({
  entry,
  is_pending,
  on_save,
  on_cancel,
}: EntryEditFormProps) {
  const [start, set_start] = useState('')
  const [end, set_end] = useState('')

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const trimmed_start = start.trim()
    const trimmed_end = end.trim()

    if (trimmed_start.length === 0 && trimmed_end.length === 0) {
      return
    }

    on_save({
      ...(trimmed_start.length > 0 ? { start: trimmed_start } : {}),
      ...(trimmed_end.length > 0 ? { end: trimmed_end } : {}),
    })
  }

  const end_hint = entry.isActive
    ? 'still running'
    : format_datetime_hint(entry.end ?? entry.start)

  return (
    <form className="entry-edit-form" onSubmit={handle_submit}>
      <p className="entry-edit-form__title">Edit times</p>
      <div className="entry-edit-form__fields">
        <label className="entry-edit-form__field" htmlFor={`entry-start-${entry.id}`}>
          <span className="entry-edit-form__label">Start</span>
          <span className="entry-edit-form__current">
            Current: {format_datetime_hint(entry.start)}
          </span>
          <input
            id={`entry-start-${entry.id}`}
            className="input input--compact"
            value={start}
            onChange={(event) => set_start(event.target.value)}
            placeholder="e.g. 10am, 30 minutes ago"
            disabled={is_pending}
          />
        </label>
        <label className="entry-edit-form__field" htmlFor={`entry-end-${entry.id}`}>
          <span className="entry-edit-form__label">End</span>
          <span className="entry-edit-form__current">Current: {end_hint}</span>
          <input
            id={`entry-end-${entry.id}`}
            className="input input--compact"
            value={end}
            onChange={(event) => set_end(event.target.value)}
            placeholder={
              entry.isActive ? 'e.g. now, 5 minutes ago' : 'e.g. 11:30am'
            }
            disabled={is_pending}
          />
        </label>
      </div>
      <div className="entry-edit-form__actions">
        <button
          type="submit"
          className="button button--small button--primary"
          disabled={
            is_pending || (start.trim().length === 0 && end.trim().length === 0)
          }
        >
          Save
        </button>
        <button
          type="button"
          className="button button--small button--ghost"
          disabled={is_pending}
          onClick={on_cancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
