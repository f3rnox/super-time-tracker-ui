'use client'

import { useEffect, useState } from 'react'

import { Checkbox } from '@/components/checkbox'
import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { EntryActionsMenu } from '@/components/entry-actions-menu'
import { EntryNotesList } from '@/components/entry-notes-list'
import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { EntryListBulkBar } from '@/components/entry-list-bulk-bar'
import { format_time } from '@/components/format_time'
import { get_delete_entries_confirm_dialog } from '@/lib/get_delete_entries_confirm_dialog'
import { get_delete_entry_confirm_dialog } from '@/lib/get_delete_entry_confirm_dialog'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { get_entry_row_key } from '@/lib/get_entry_row_key'
import { use_duration_format } from '@/lib/use_duration_format'
import { use_time_format } from '@/lib/use_time_format'
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
  on_delete_many: (entries: SerializedEntry[]) => void
  on_edit_note: (
    entry: SerializedEntry,
    timestamp: string,
    text: string,
  ) => void
  on_add_note: (entry: SerializedEntry, text: string) => void
  on_resume: (entry: SerializedEntry) => void
}

const tag_item_class =
  'rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text'

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
  on_delete_many,
  on_edit_note,
  on_add_note,
  on_resume,
}: EntryListProps) {
  const { confirm } = use_confirm_dialog()
  const time_format = use_time_format()
  const duration_format = use_duration_format()
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

  const handle_bulk_delete = async (): Promise<void> => {
    if (selected_entries.length === 0) {
      return
    }

    const confirmed = await confirm(
      get_delete_entries_confirm_dialog(selected_entries),
    )

    if (!confirmed) {
      return
    }

    on_delete_many(selected_entries)
    clear_selection()
  }

  const has_selection = selected_entries.length > 0

  return (
    <section className="min-w-0">
      <header className="mb-3 flex flex-col gap-2 border-b border-panel-border pb-2.5 compact:mb-2 compact:pb-1.5">
        {has_selection ? (
          <EntryListBulkBar
            selected_count={selected_entries.length}
            total_count={entries.length}
            all_selected={all_selected}
            some_selected={some_selected}
            selected_entries={selected_entries}
            sheets={sheets}
            is_pending={is_pending}
            on_toggle_all={toggle_all}
            on_move={handle_bulk_move}
            on_delete={() => void handle_bulk_delete()}
            on_clear={clear_selection}
          />
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {entries.length > 0 ? (
                <Checkbox
                  className="shrink-0"
                  checked={all_selected}
                  indeterminate={some_selected}
                  disabled={is_pending}
                  aria_label="Select all entries"
                  on_change={toggle_all}
                />
              ) : null}
              <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em]">
                {title}
              </h2>
              <span className="text-[0.8rem] text-muted">
                {entries.length === 0
                  ? null
                  : entries.length === 1
                    ? '1 entry'
                    : `${entries.length} entries`}
              </span>
            </div>
            <p className="m-0 font-mono text-[0.85rem] text-muted">
              {format_duration(total_ms, duration_format)} total
            </p>
          </div>
        )}
      </header>
      {entries.length === 0 ? (
        <p className="m-0 text-muted">{empty_message}</p>
      ) : (
        <>
          <ul className="m-0 flex list-none flex-col p-0">
            {entries.map((entry) => {
              const row_key = get_entry_row_key(entry)
              const is_editing = editing_key === row_key
              const is_selected = selected_keys.has(row_key)

              if (is_editing) {
                return (
                  <li
                    key={row_key}
                    className="block border-b border-panel-border py-2.5 last:border-b-0 compact:py-1.5"
                  >
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
                  className={`group relative flex flex-col gap-0 border-b border-panel-border px-2 py-2.5 transition-colors duration-150 last:border-b-0 hover:bg-surface-hover compact:py-1.5 ${
                    is_selected
                      ? 'bg-accent-soft hover:bg-accent-soft'
                      : ''
                  }`}
                >
                  <div className="flex w-full min-w-0 items-center gap-2.5 compact:gap-1.5">
                    <label
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed"
                      aria-label={`Select entry ${entry.description || 'Untitled entry'}`}
                    >
                      <Checkbox
                        nested
                        className={`shrink-0 pr-1 transition-opacity duration-150 compact:pr-0.5 ${
                          is_selected || has_selection
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                        }`}
                        checked={is_selected}
                        disabled={is_pending}
                        on_change={() => toggle_entry(row_key)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 overflow-wrap-anywhere font-semibold leading-snug compact:text-[0.9rem] compact:leading-tight">
                          {entry.description || 'Untitled entry'}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[0.8rem] text-muted compact:mt-px compact:gap-0.5 compact:text-[0.72rem]">
                          {show_sheet_name ? (
                            <>
                              <span>{entry.sheetName}</span>
                              <span>·</span>
                            </>
                          ) : null}
                          <span>#{entry.id}</span>
                          <span>·</span>
                          <span className="whitespace-nowrap">
                            {format_time(entry.start, time_format)}
                            {entry.end === null
                              ? ' → now'
                              : ` → ${format_time(entry.end, time_format)}`}
                          </span>
                          {entry.tags.length > 0 ? (
                            <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
                              {entry.tags.map((tag) => (
                                <li key={tag} className={tag_item_class}>
                                  {format_display_tag(tag)}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </label>
                    <div className="flex shrink-0 flex-row items-center gap-2 max-[860px]:flex-wrap max-[860px]:justify-end compact:gap-1.5">
                      <p
                        className={`m-0 whitespace-nowrap text-right font-mono text-[0.9rem] text-muted compact:text-[0.8rem] ${
                          entry.isActive ? 'text-accent' : ''
                        }`}
                      >
                        {format_duration(entry.durationMs, duration_format)}
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
                        on_delete={async () => {
                          const confirmed = await confirm(
                            get_delete_entry_confirm_dialog(entry),
                          )

                          if (confirmed) {
                            on_delete(entry)
                          }
                        }}
                      />
                    </div>
                  </div>
                  {entry.notes.length > 0 ? (
                    <div className="w-full pt-1 pl-[calc(0.85rem+0.5rem+0.35rem)] compact:pt-0.5 compact:pl-[calc(0.85rem+0.35rem+0.2rem)]">
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
