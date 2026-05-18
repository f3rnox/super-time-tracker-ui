'use client'

import { type FormEvent, useState } from 'react'

import { format_datetime_hint } from '@/components/format_datetime_hint'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { type SerializedEntry } from '@/lib/types/tracker_state'

export interface EntryEditFormValues {
  start?: string
  end?: string
}

interface EntryEditFormProps {
  entry: SerializedEntry
  is_pending: boolean
  in_active_panel?: boolean
  on_save: (values: EntryEditFormValues) => void
  on_cancel: () => void
}

/**
 * Form for editing an entry's start and end times with natural language.
 */
export function EntryEditForm({
  entry,
  is_pending,
  in_active_panel = false,
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
    <form
      className={`flex flex-col gap-3 rounded-[0.65rem] border border-panel-border bg-input-bg p-3 ${in_active_panel ? 'mt-2' : ''}`}
      onSubmit={handle_submit}
    >
      <p className="m-0 text-[0.85rem] font-semibold">Edit times</p>
      <div className="grid grid-cols-2 gap-2.5 max-[860px]:grid-cols-1">
        <label className="flex flex-col gap-1" htmlFor={`entry-start-${entry.id}`}>
          <span className="text-[0.8rem] font-semibold">Start</span>
          <span className="text-[0.72rem] text-muted">
            Current: {format_datetime_hint(entry.start)}
          </span>
          <input
            id={`entry-start-${entry.id}`}
            className={get_input_class_name('compact')}
            value={start}
            onChange={(event) => set_start(event.target.value)}
            placeholder="e.g. 10am, 30 minutes ago"
            disabled={is_pending}
          />
        </label>
        <label className="flex flex-col gap-1" htmlFor={`entry-end-${entry.id}`}>
          <span className="text-[0.8rem] font-semibold">End</span>
          <span className="text-[0.72rem] text-muted">Current: {end_hint}</span>
          <input
            id={`entry-end-${entry.id}`}
            className={get_input_class_name('compact')}
            value={end}
            onChange={(event) => set_end(event.target.value)}
            placeholder={
              entry.isActive ? 'e.g. now, 5 minutes ago' : 'e.g. 11:30am'
            }
            disabled={is_pending}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={get_button_class_name('primary', 'small')}
          disabled={
            is_pending || (start.trim().length === 0 && end.trim().length === 0)
          }
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
    </form>
  )
}
