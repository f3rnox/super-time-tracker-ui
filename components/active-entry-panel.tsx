'use client'

import { useEffect, useState } from 'react'

import { CheckoutButtonGroup } from '@/components/checkout-button-group'
import { EntryActionsMenu } from '@/components/entry-actions-menu'
import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { EntryNotesList } from '@/components/entry-notes-list'
import { NoteForm } from '@/components/note-form'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { confirm_delete_entry } from '@/lib/confirm_delete_entry'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface ActiveEntryPanelProps {
  entry: SerializedEntry
  sheets: SerializedSheet[]
  in_bar?: boolean
  on_check_out: (at?: string) => void
  on_delete: () => void
  on_edit: (values: EntryEditFormValues) => void
  on_move: (target_sheet_name: string) => void
  on_add_note: (text: string) => void
  on_edit_note: (timestamp: string, text: string) => void
  is_pending: boolean
}

/**
 * Shows the running active entry with a live duration timer.
 */
export function ActiveEntryPanel({
  entry,
  sheets,
  in_bar = false,
  on_check_out,
  on_delete,
  on_edit,
  on_move,
  on_add_note,
  on_edit_note,
  is_pending,
}: ActiveEntryPanelProps) {
  const [duration_ms, set_duration_ms] = useState(entry.durationMs)
  const [is_editing, set_is_editing] = useState(false)

  useEffect(() => {
    set_duration_ms(entry.durationMs)

    const interval = window.setInterval(() => {
      set_duration_ms(Date.now() - new Date(entry.start).getTime())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [entry.durationMs, entry.start])

  const panel_class = in_bar
    ? 'active-panel active-panel--in-bar'
    : 'active-panel'

  if (is_editing) {
    return (
      <section className={panel_class}>
        <EntryEditForm
          entry={entry}
          is_pending={is_pending}
          on_cancel={() => set_is_editing(false)}
          on_save={(values) => {
            on_edit(values)
            set_is_editing(false)
          }}
        />
      </section>
    )
  }

  return (
    <section className={panel_class}>
      <div className="active-panel__header">
        <div className="active-panel__heading">
          <span className="active-panel__badge">Tracking</span>
          <h2 className="active-panel__title">
            {entry.description || 'Untitled entry'}
          </h2>
        </div>
        <EntryActionsMenu
          current_sheet_name={entry.sheetName}
          sheets={sheets}
          is_pending={is_pending}
          on_edit={() => set_is_editing(true)}
          on_move={on_move}
          on_delete={() => {
            if (confirm_delete_entry(entry)) {
              on_delete()
            }
          }}
        />
      </div>
      <div className="active-panel__body">
        <div className="active-panel__timer-block">
          <p className="active-panel__duration">
            {format_duration(duration_ms)}
          </p>
          {entry.tags.length > 0 ? (
            <ul className="tag-list">
              {entry.tags.map((tag) => (
                <li key={tag} className="tag-list__item">
                  {format_display_tag(tag)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <CheckoutButtonGroup
          is_pending={is_pending}
          on_check_out={on_check_out}
        />
      </div>
      <EntryNotesList
        notes={entry.notes}
        is_pending={is_pending}
        on_edit_note={on_edit_note}
      />
      <NoteForm is_pending={is_pending} on_submit={on_add_note} />
    </section>
  )
}
