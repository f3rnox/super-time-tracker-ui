'use client'

import { useEffect, useState } from 'react'

import { Checkbox } from '@/components/checkbox'
import { EntryActionsMenu } from '@/components/entry-actions-menu'
import { EntryNotesList } from '@/components/entry-notes-list'
import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { EntryListBulkBar } from '@/components/entry-list-bulk-bar'
import { format_time } from '@/components/format_time'
import { confirm_delete_entry } from '@/lib/confirm_delete_entry'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { get_entry_row_key } from '@/lib/get_entry_row_key'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface EntryListProps {
  title: string
  entries: SerializedEntry[]
  sheets: SerializedSheet[]
  total_ms: number
  empty_message: string
  is_pending: boolean
  show_sheet_name?: boolean
  on_delete: (entry: SerializedEntry) => void
  on_edit: (entry: SerializedEntry, values: EntryEditFormValues) => void
  on_move: (entry: SerializedEntry, target_sheet_name: string) => void
  on_move_many: (
    entries: SerializedEntry[],
    target_sheet_name: string,
  ) => void
  on_edit_note: (
    entry: SerializedEntry,
    timestamp: string,
    text: string,
  ) => void
  on_add_note: (entry: SerializedEntry, text: string) => void
  on_resume: (entry: SerializedEntry) => void
}

/**
 * Renders a list of time sheet entries with edit and delete actions.
 */
export function EntryList({
  title,
  entries,
  sheets,
  total_ms,
  empty_message,
  is_pending,
  show_sheet_name = true,
  on_delete,
  on_edit,
  on_move,
  on_move_many,
  on_edit_note,
  on_add_note,
  on_resume,
}: EntryListProps) {
  const [editing_key, set_editing_key] = useState<string | null>(null)
  const [selected_keys, set_selected_keys] = useState<Set<string>>(() => new Set())

  const entry_keys = entries.map((entry) => get_entry_row_key(entry))
  const selected_entries = entries.filter((entry) =>
    selected_keys.has(get_entry_row_key(entry)),
  )
  const all_selected =
    entries.length > 0 && selected_entries.length === entries.length
  const some_selected =
    selected_entries.length > 0 && selected_entries.length < entries.length

  useEffect(() => {
    set_selected_keys((previous) => {
      const valid_keys = new Set(entry_keys)
      const next = new Set(
        [...previous].filter((key) => valid_keys.has(key)),
      )

      return next.size === previous.size ? previous : next
    })
  }, [entry_keys.join('|')])

  const toggle_entry = (row_key: string): void => {
    set_selected_keys((previous) => {
      const next = new Set(previous)

      if (next.has(row_key)) {
        next.delete(row_key)
      } else {
        next.add(row_key)
      }

      return next
    })
  }

  const toggle_all = (): void => {
    if (all_selected) {
      set_selected_keys(new Set())
      return
    }

    set_selected_keys(new Set(entry_keys))
  }

  const clear_selection = (): void => {
    set_selected_keys(new Set())
  }

  const handle_bulk_move = (target_sheet_name: string): void => {
    on_move_many(selected_entries, target_sheet_name)
    clear_selection()
  }

  return (
    <section className="entry-list-section">
      <header className="entry-list-section__header">
        <div className="entry-list-section__heading">
          <h2 className="entry-list-section__title">{title}</h2>
          {entries.length > 0 ? (
            <Checkbox
              className="entry-list-section__select-all"
              checked={all_selected}
              indeterminate={some_selected}
              disabled={is_pending}
              label="Select all"
              on_change={toggle_all}
            />
          ) : null}
        </div>
        <p className="entry-list-section__total">
          {format_duration(total_ms)} total
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="entry-list-section__empty">{empty_message}</p>
      ) : (
        <>
          {selected_entries.length > 0 ? (
            <div className="entry-list-section__toolbar">
              <EntryListBulkBar
                selected_count={selected_entries.length}
                selected_entries={selected_entries}
                sheets={sheets}
                is_pending={is_pending}
                on_move={handle_bulk_move}
                on_clear={clear_selection}
              />
            </div>
          ) : null}
          <ul className="entry-list">
            {entries.map((entry) => {
              const row_key = get_entry_row_key(entry)
              const is_editing = editing_key === row_key
              const is_selected = selected_keys.has(row_key)

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
                <li
                  key={row_key}
                  className={`entry-row${
                    is_selected ? ' entry-row--selected' : ''
                  }`}
                >
                  <div className="entry-row__primary">
                  <label
                    className="entry-row__select-area"
                    aria-label={`Select entry ${entry.description || 'Untitled entry'}`}
                  >
                    <Checkbox
                      nested
                      className="entry-row__select"
                      checked={is_selected}
                      disabled={is_pending}
                      on_change={() => toggle_entry(row_key)}
                    />
                    <div className="entry-row__main">
                      <p className="entry-row__description">
                        {entry.description || 'Untitled entry'}
                      </p>
                      <div className="entry-row__meta">
                        {show_sheet_name ? (
                          <>
                            <span>{entry.sheetName}</span>
                            <span>·</span>
                          </>
                        ) : null}
                        <span>#{entry.id}</span>
                        <span>·</span>
                        <span className="entry-row__times">
                          {format_time(entry.start)}
                          {entry.end === null
                            ? ' → now'
                            : ` → ${format_time(entry.end)}`}
                        </span>
                        {entry.tags.length > 0 ? (
                          <ul className="tag-list tag-list--meta">
                            {entry.tags.map((tag) => (
                              <li key={tag} className="tag-list__item">
                                {format_display_tag(tag)}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </label>
                  <div className="entry-row__aside">
                    <p
                      className={`entry-row__duration${
                        entry.isActive ? ' entry-row__duration--active' : ''
                      }`}
                    >
                      {format_duration(entry.durationMs)}
                    </p>
                    <EntryActionsMenu
                      current_sheet_name={entry.sheetName}
                      sheets={sheets}
                      is_pending={is_pending}
                      on_edit={() => set_editing_key(row_key)}
                      on_add_note={(text) => on_add_note(entry, text)}
                      on_resume={() => on_resume(entry)}
                      entry_is_active={entry.isActive}
                      on_move={(target_sheet_name) =>
                        on_move(entry, target_sheet_name)
                      }
                      on_delete={() => {
                        if (confirm_delete_entry(entry)) {
                          on_delete(entry)
                        }
                      }}
                    />
                  </div>
                  </div>
                  {entry.notes.length > 0 ? (
                    <div className="entry-row__notes">
                      <EntryNotesList
                        notes={entry.notes}
                        variant="inline"
                        is_pending={is_pending}
                        on_edit_note={(timestamp, text) =>
                          on_edit_note(entry, timestamp, text)
                        }
                      />
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
