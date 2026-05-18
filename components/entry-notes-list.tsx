'use client'

import { type MouseEvent, useState } from 'react'

import { ChevronIcon } from '@/components/chevron-icon'
import { format_time } from '@/components/format_time'
import { NoteEditForm } from '@/components/note-edit-form'
import { PencilIcon } from '@/components/pencil-icon'
import { type SerializedNote } from '@/lib/types/tracker_state'

type EntryNotesListVariant = 'panel' | 'inline'

interface EntryNotesListProps {
  notes: SerializedNote[]
  variant?: EntryNotesListVariant
  is_pending?: boolean
  on_edit_note?: (timestamp: string, text: string) => void
}

/**
 * Renders notes attached to a time sheet entry.
 */
export function EntryNotesList({
  notes,
  variant = 'panel',
  is_pending = false,
  on_edit_note,
}: EntryNotesListProps) {
  const [editing_timestamp, set_editing_timestamp] = useState<string | null>(
    null,
  )
  const [is_expanded, set_is_expanded] = useState(false)

  if (notes.length === 0) {
    return null
  }

  const sorted_notes = [...notes].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  )

  const root_class = [
    'entry-notes',
    variant === 'inline' ? 'entry-notes--inline' : 'entry-notes--panel',
    is_expanded || editing_timestamp !== null ? 'entry-notes--expanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const can_edit = on_edit_note !== undefined
  const is_list_visible = is_expanded || editing_timestamp !== null
  const toggle_label =
    variant === 'panel'
      ? `Notes (${notes.length})`
      : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`

  const handle_save = (timestamp: string, text: string): void => {
    on_edit_note?.(timestamp, text)
    set_editing_timestamp(null)
  }

  const start_editing = (timestamp: string): void => {
    set_is_expanded(true)
    set_editing_timestamp(timestamp)
  }

  const handle_toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()

    if (editing_timestamp !== null) {
      return
    }

    set_is_expanded((previous) => !previous)
  }

  return (
    <section className={root_class} aria-label="Entry notes">
      <button
        type="button"
        className="entry-notes__toggle"
        aria-expanded={is_list_visible}
        onClick={handle_toggle}
      >
        <ChevronIcon />
        <span>{toggle_label}</span>
      </button>
      {is_list_visible ? (
        <ul className="entry-notes__list">
          {sorted_notes.map((note, index) => {
            const is_editing = editing_timestamp === note.timestamp

            return (
              <li
                key={`${note.timestamp}-${index}`}
                className="entry-notes__item"
              >
                {is_editing ? (
                  <NoteEditForm
                    initial_text={note.text}
                    is_pending={is_pending}
                    on_cancel={() => set_editing_timestamp(null)}
                    on_save={(text) => handle_save(note.timestamp, text)}
                  />
                ) : variant === 'inline' ? (
                  <div className="entry-notes__item-row">
                    <p className="entry-notes__line">
                      <time
                        className="entry-notes__time"
                        dateTime={note.timestamp}
                      >
                        {format_time(note.timestamp)}
                      </time>
                      <span className="entry-notes__text">{note.text}</span>
                    </p>
                    {can_edit ? (
                      <button
                        type="button"
                        className="entry-notes__edit"
                        aria-label="Edit note"
                        title="Edit note"
                        disabled={is_pending}
                        onClick={(event) => {
                          event.stopPropagation()
                          start_editing(note.timestamp)
                        }}
                      >
                        <PencilIcon />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div className="entry-notes__item-head">
                      <time
                        className="entry-notes__time"
                        dateTime={note.timestamp}
                      >
                        {format_time(note.timestamp)}
                      </time>
                      {can_edit ? (
                        <button
                          type="button"
                          className="entry-notes__edit"
                          aria-label="Edit note"
                          title="Edit note"
                          disabled={is_pending}
                          onClick={() => start_editing(note.timestamp)}
                        >
                          <PencilIcon />
                        </button>
                      ) : null}
                    </div>
                    <p className="entry-notes__text">{note.text}</p>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
