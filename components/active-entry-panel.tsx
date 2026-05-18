'use client'

import { useEffect, useState } from 'react'

import { ActiveEntryActionsMenu } from '@/components/active-entry-actions-menu'
import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { confirm_delete_entry } from '@/lib/confirm_delete_entry'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface ActiveEntryPanelProps {
  entry: SerializedEntry
  on_check_out: () => void
  on_delete: () => void
  on_edit: (values: EntryEditFormValues) => void
  is_pending: boolean
}

/**
 * Shows the running active entry with a live duration timer.
 */
export function ActiveEntryPanel({
  entry,
  on_check_out,
  on_delete,
  on_edit,
  is_pending,
}: ActiveEntryPanelProps) {
  const [duration_ms, set_duration_ms] = useState(
    () => Date.now() - new Date(entry.start).getTime(),
  )
  const [is_editing, set_is_editing] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      set_duration_ms(Date.now() - new Date(entry.start).getTime())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [entry.start])

  if (is_editing) {
    return (
      <section className="active-panel">
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
    <section className="active-panel">
      <div className="active-panel__layout">
        <div className="active-panel__meta">
          <span className="active-panel__badge">Tracking</span>
          <p className="active-panel__sheet">{entry.sheetName}</p>
        </div>

        <div className="active-panel__menu-slot">
          <ActiveEntryActionsMenu
            is_pending={is_pending}
            on_edit={() => set_is_editing(true)}
            on_delete={() => {
              if (confirm_delete_entry(entry)) {
                on_delete()
              }
            }}
          />
        </div>

        <h2 className="active-panel__title">
          {entry.description || 'Untitled entry'}
        </h2>

        <div className="active-panel__details">
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

        <div className="active-panel__actions">
          <button
            type="button"
            className="button button--danger active-panel__checkout"
            disabled={is_pending}
            onClick={on_check_out}
          >
            Check out
          </button>
        </div>
      </div>
    </section>
  )
}
