'use client'

import { useState } from 'react'

import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { format_time } from '@/components/format_time'
import { confirm_delete_entry } from '@/lib/confirm_delete_entry'
import { format_duration } from '@/lib/format_duration'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface EntryListProps {
  entries: SerializedEntry[]
  total_ms: number
  is_pending: boolean
  on_delete: (entry: SerializedEntry) => void
  on_edit: (entry: SerializedEntry, values: EntryEditFormValues) => void
}

/**
 * Renders today&apos;s entries in reverse chronological order.
 */
export function EntryList({
  entries,
  total_ms,
  is_pending,
  on_delete,
  on_edit,
}: EntryListProps) {
  const [editing_key, set_editing_key] = useState<string | null>(null)

  return (
    <section className="entry-list-section">
      <header className="entry-list-section__header">
        <h2 className="entry-list-section__title">Today</h2>
        <p className="entry-list-section__total">
          {format_duration(total_ms)} total
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="entry-list-section__empty">No entries yet today.</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => {
            const row_key = `${entry.sheetName}-${entry.id}`
            const is_editing = editing_key === row_key

            if (is_editing) {
              return (
                <li key={row_key} className="entry-row entry-row--editing">
                  <EntryEditForm
                    entry={entry}
                    is_pending={is_pending}
                    on_cancel={() => set_editing_key(null)}
                    on_save={(values) => {
                      on_edit(entry, values)
                      set_editing_key(null)
                    }}
                  />
                </li>
              )
            }

            return (
              <li key={row_key} className="entry-row">
                <div className="entry-row__main">
                  <p className="entry-row__description">
                    {entry.description || 'Untitled entry'}
                  </p>
                  <p className="entry-row__meta">
                    <span>{entry.sheetName}</span>
                    <span>·</span>
                    <span>
                      {format_time(entry.start)}
                      {entry.end === null
                        ? ' → now'
                        : ` → ${format_time(entry.end)}`}
                    </span>
                  </p>
                  {entry.tags.length > 0 ? (
                    <ul className="tag-list tag-list--inline">
                      {entry.tags.map((tag) => (
                        <li key={tag} className="tag-list__item">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="entry-row__aside">
                  <p
                    className={`entry-row__duration${
                      entry.isActive ? ' entry-row__duration--active' : ''
                    }`}
                  >
                    {format_duration(entry.durationMs)}
                  </p>
                  <button
                    type="button"
                    className="button button--small button--ghost"
                    disabled={is_pending}
                    onClick={() => set_editing_key(row_key)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--small button--danger"
                    disabled={is_pending}
                    aria-label={`Delete entry ${entry.description || 'Untitled entry'}`}
                    onClick={() => {
                      if (confirm_delete_entry(entry)) {
                        on_delete(entry)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
