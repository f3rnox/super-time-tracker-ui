'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { Checkbox } from '@/components/checkbox'
import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { EntryActionsMenu } from '@/components/entry-actions-menu'
import { EntryNotesList } from '@/components/entry-notes-list'
import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { EntryListBulkBar } from '@/components/entry-list-bulk-bar'
import { EntryListSortControls } from '@/components/entry-list-sort-controls'
import { format_time } from '@/components/format_time'
import { entry_can_split } from '@/lib/entry_can_split'
import { get_delete_entries_confirm_dialog } from '@/lib/get_delete_entries_confirm_dialog'
import { get_delete_entry_confirm_dialog } from '@/lib/get_delete_entry_confirm_dialog'
import { get_merge_entries_confirm_dialog } from '@/lib/get_merge_entries_confirm_dialog'
import {
  get_mergeable_entry_neighbors,
  type MergeEntryDirection,
} from '@/lib/get_mergeable_entry_neighbors'
import { get_split_entry_confirm_dialog } from '@/lib/get_split_entry_confirm_dialog'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { get_entry_row_key } from '@/lib/get_entry_row_key'
import { claude_api_key_preference } from '@/lib/preferences/claude_api_key_preference'
import { entry_suggestion_provider_preference } from '@/lib/preferences/entry_suggestion_provider_preference'
import { google_ai_api_key_preference } from '@/lib/preferences/google_ai_api_key_preference'
import { openai_api_key_preference } from '@/lib/preferences/openai_api_key_preference'
import { request_ai_entry_description_suggestion } from '@/lib/request_ai_entry_description_suggestion'
import { use_confirm_destructive_actions } from '@/lib/use_confirm_destructive_actions'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'
import { use_duration_format } from '@/lib/use_duration_format'
import { use_time_format } from '@/lib/use_time_format'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface EntryListProps {
  title: string
  entries: SerializedEntry[]
  /** Full sheet entries used to detect merge neighbors (defaults to entries). */
  merge_context_entries?: SerializedEntry[]
  sheets: SerializedSheet[]
  known_tags: string[]
  total_ms: number
  empty_message: string
  is_pending: boolean
  show_sheet_name?: boolean
  header_extra?: React.ReactNode
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
  on_split?: (entry: SerializedEntry, at: string) => void
  on_merge?: (entry: SerializedEntry, direction: MergeEntryDirection) => void
}

const tag_item_class =
  'rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text'

/**
 * Renders a list of time sheet entries with edit and delete actions.
 */
export function EntryList({
  title,
  entries,
  merge_context_entries,
  sheets,
  known_tags,
  total_ms,
  empty_message,
  is_pending,
  show_sheet_name = true,
  header_extra,
  on_delete,
  on_edit,
  on_move,
  on_move_many,
  on_delete_many,
  on_edit_note,
  on_add_note,
  on_resume,
  on_split,
  on_merge,
}: EntryListProps) {
  const { confirm } = use_confirm_dialog()
  const confirm_destructive_actions = use_confirm_destructive_actions()
  const time_format = use_time_format()
  const duration_format = use_duration_format()
  const [editing_key, set_editing_key] = useState<string | null>(null)
  const [selected_keys, set_selected_keys] = useState<Set<string>>(() => new Set())
  const [ai_revise_pending_key, set_ai_revise_pending_key] = useState<string | null>(
    null,
  )
  const [ai_revise_error, set_ai_revise_error] = useState<string | null>(null)
  const [ai_revise_draft_by_key, set_ai_revise_draft_by_key] = useState<
    Record<string, string>
  >({})
  const suggestion_provider = useSyncExternalStore(
    entry_suggestion_provider_preference.subscribe,
    entry_suggestion_provider_preference.get_snapshot,
    entry_suggestion_provider_preference.get_server_snapshot,
  )
  const openai_api_key = useSyncExternalStore(
    openai_api_key_preference.subscribe,
    openai_api_key_preference.get_snapshot,
    openai_api_key_preference.get_server_snapshot,
  )
  const claude_api_key = useSyncExternalStore(
    claude_api_key_preference.subscribe,
    claude_api_key_preference.get_snapshot,
    claude_api_key_preference.get_server_snapshot,
  )
  const google_ai_api_key = useSyncExternalStore(
    google_ai_api_key_preference.subscribe,
    google_ai_api_key_preference.get_snapshot,
    google_ai_api_key_preference.get_server_snapshot,
  )
  const selected_api_key =
    suggestion_provider === 'openai'
      ? openai_api_key
      : suggestion_provider === 'claude'
        ? claude_api_key
        : suggestion_provider === 'google_ai'
          ? google_ai_api_key
        : ''

  const merge_neighbors_by_key = useMemo(() => {
    const merge_source = merge_context_entries ?? entries
    const map = new Map<string, ReturnType<typeof get_mergeable_entry_neighbors>>()

    for (const entry of entries) {
      const key = get_entry_row_key(entry)
      map.set(key, get_mergeable_entry_neighbors(entry, merge_source))
    }

    return map
  }, [entries, merge_context_entries])
  const can_revise_description_ai =
    suggestion_provider !== 'none' && selected_api_key.trim().length > 0

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

    const confirmed = confirm_destructive_actions
      ? await confirm(get_delete_entries_confirm_dialog(selected_entries))
      : true

    if (!confirmed) {
      return
    }

    on_delete_many(selected_entries)
    clear_selection()
  }

  const has_selection = selected_entries.length > 0

  const revise_entry_description_with_ai = async (
    entry: SerializedEntry,
  ): Promise<void> => {
    if (!can_revise_description_ai) {
      return
    }

    const row_key = get_entry_row_key(entry)
    set_ai_revise_pending_key(row_key)
    set_ai_revise_error(null)

    try {
      const notes_context = entry.notes.map((note) => note.text).join('\n')
      const description = await request_ai_entry_description_suggestion({
        provider: suggestion_provider,
        api_key: selected_api_key,
        context: entry.description,
        notes: notes_context,
      })
      set_ai_revise_draft_by_key((previous) => ({
        ...previous,
        [row_key]: description,
      }))
      set_editing_key(row_key)
    } catch (error: unknown) {
      set_ai_revise_error(error instanceof Error ? error.message : String(error))
    } finally {
      set_ai_revise_pending_key(null)
    }
  }

  use_escape_to_cancel(clear_selection, has_selection && editing_key === null)

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
          <>
            {header_extra}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex min-w-0 items-center gap-2">
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
              <p className="m-0 font-mono text-[0.85rem] text-muted max-[640px]:w-full">
                {format_duration(total_ms, duration_format)} total
              </p>
            </div>
            <EntryListSortControls is_pending={is_pending} />
            {ai_revise_error !== null ? (
              <p className="m-0 text-[0.8rem] text-danger">{ai_revise_error}</p>
            ) : null}
          </>
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
                      known_tags={known_tags}
                      is_pending={is_pending}
                      initial_description_override={ai_revise_draft_by_key[row_key]}
                      on_cancel={() => {
                        set_editing_key(null)
                        set_ai_revise_draft_by_key((previous) => {
                          if (!(row_key in previous)) {
                            return previous
                          }
                          const next = { ...previous }
                          delete next[row_key]
                          return next
                        })
                      }}
                      on_save={(values) => {
                        on_edit(entry, values)
                        set_editing_key(null)
                        set_ai_revise_draft_by_key((previous) => {
                          if (!(row_key in previous)) {
                            return previous
                          }
                          const next = { ...previous }
                          delete next[row_key]
                          return next
                        })
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
                  <div className="flex w-full min-w-0 flex-col items-start gap-2.5 min-[700px]:flex-row min-[700px]:items-center compact:gap-1.5">
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
                    <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 min-[700px]:w-auto min-[700px]:justify-end max-[860px]:flex-wrap compact:gap-1.5">
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
                        is_pending={is_pending || ai_revise_pending_key === row_key}
                        can_split={on_split !== undefined && entry_can_split(entry)}
                        on_split={
                          on_split === undefined
                            ? undefined
                            : async (at) => {
                                const confirmed = confirm_destructive_actions
                                  ? await confirm(
                                      get_split_entry_confirm_dialog(entry, at),
                                    )
                                  : true

                                if (confirmed) {
                                  on_split(entry, at)
                                }
                              }
                        }
                        can_merge_previous={
                          merge_neighbors_by_key.get(row_key)?.previous === true
                        }
                        can_merge_next={
                          merge_neighbors_by_key.get(row_key)?.next === true
                        }
                        on_merge={
                          on_merge === undefined
                            ? undefined
                            : async (direction) => {
                                const confirmed = confirm_destructive_actions
                                  ? await confirm(
                                      get_merge_entries_confirm_dialog(
                                        entry,
                                        direction,
                                      ),
                                    )
                                  : true

                                if (confirmed) {
                                  on_merge(entry, direction)
                                }
                              }
                        }
                        on_edit={() => {
                          set_editing_key(row_key)
                          set_ai_revise_draft_by_key((previous) => {
                            if (!(row_key in previous)) {
                              return previous
                            }
                            const next = { ...previous }
                            delete next[row_key]
                            return next
                          })
                        }}
                        on_revise_description_ai={
                          can_revise_description_ai
                            ? () => void revise_entry_description_with_ai(entry)
                            : undefined
                        }
                        can_revise_description_ai={can_revise_description_ai}
                        on_add_note={(text) => on_add_note(entry, text)}
                        on_resume={() => on_resume(entry)}
                        entry_is_active={entry.isActive}
                        on_move={(target_sheet_name) =>
                          on_move(entry, target_sheet_name)
                        }
                        on_delete={async () => {
                          const confirmed = confirm_destructive_actions
                            ? await confirm(
                                get_delete_entry_confirm_dialog(entry),
                              )
                            : true

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
