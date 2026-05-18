'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { CheckInFormCollapsible } from '@/components/check-in-form-collapsible'
import { EntryTagFilter } from '@/components/entry-tag-filter'
import { EntryList } from '@/components/entry-list'
import { SheetSidebar } from '@/components/sheet-sidebar'
import { TrackerActiveBar } from '@/components/tracker-active-bar'
import { TrackerDocumentTitle } from '@/components/tracker-document-title'
import { TrackerTopbar } from '@/components/tracker-topbar'
import { build_resume_description } from '@/lib/build_resume_description'
import { collect_tags_from_entries } from '@/lib/collect_tags_from_entries'
import { filter_entries_by_tags } from '@/lib/filter_entries_by_tags'
import {
  get_sheet_tag_filter_server_snapshot,
  get_sheet_tag_filter_snapshot,
} from '@/lib/get_sheet_tag_filter_snapshot'
import { get_serialized_entries_total_ms } from '@/lib/get_serialized_entries_total_ms'
import { delete_tracker_action } from '@/lib/delete_tracker_action'
import { patch_tracker_action } from '@/lib/patch_tracker_action'
import { post_tracker_action } from '@/lib/post_tracker_action'
import { set_sheet_tag_filter } from '@/lib/set_sheet_tag_filter'
import { sort_serialized_entries } from '@/lib/sort_serialized_entries'
import { subscribe_sheet_tag_filters } from '@/lib/subscribe_sheet_tag_filters'
import { sync_active_sheet_preference } from '@/lib/sync_active_sheet_preference'
import { use_clear_tag_filters_on_sheet_change } from '@/lib/use_clear_tag_filters_on_sheet_change'
import { use_entry_list_sort } from '@/lib/use_entry_list_sort'
import { use_tag_filter_mode } from '@/lib/use_tag_filter_mode'
import { type EntryEditFormValues } from '@/components/entry-edit-form'
import { get_running_entry_key } from '@/lib/get_running_entry_key'
import { type TrackerState } from '@/lib/types/tracker_state'

interface TrackerAppProps {
  initial_state: TrackerState
}

/**
 * Main client application for the super-time-tracker web UI.
 */
export function TrackerApp({ initial_state }: TrackerAppProps) {
  const [state, set_state] = useState<TrackerState>(initial_state)
  const [error, set_error] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)
  const [focused_running_key, set_focused_running_key] = useState<string | null>(
    () => {
      const first_running = initial_state.runningEntries[0]

      return first_running !== undefined
        ? get_running_entry_key(first_running)
        : null
    },
  )

  useEffect(() => {
    sync_active_sheet_preference(initial_state)
  }, [initial_state])

  const run_action = async (
    action: () => Promise<TrackerState>,
  ): Promise<void> => {
    set_is_pending(true)
    set_error(null)

    try {
      const next_state = await action()
      sync_active_sheet_preference(next_state)
      set_state(next_state)
    } catch (action_error: unknown) {
      set_error(
        action_error instanceof Error
          ? action_error.message
          : String(action_error),
      )
    } finally {
      set_is_pending(false)
    }
  }

  const active_sheet =
    state.sheets.find((sheet) => sheet.isActive)?.name ?? 'main'

  useEffect(() => {
    if (state.runningEntries.length === 0) {
      set_focused_running_key(null)
      return
    }

    const on_active_sheet = state.runningEntries.find(
      (entry) => entry.sheetName === active_sheet,
    )

    if (on_active_sheet !== undefined) {
      const active_key = get_running_entry_key(on_active_sheet)
      set_focused_running_key((previous) =>
        previous === active_key ? previous : active_key,
      )
      return
    }

    set_focused_running_key((previous) => {
      if (
        previous !== null &&
        state.runningEntries.some(
          (entry) => get_running_entry_key(entry) === previous,
        )
      ) {
        return previous
      }

      return get_running_entry_key(state.runningEntries[0])
    })
  }, [state.runningEntries, active_sheet])

  const focused_running_entry = useMemo(() => {
    if (focused_running_key === null) {
      return null
    }

    return (
      state.runningEntries.find(
        (entry) => get_running_entry_key(entry) === focused_running_key,
      ) ?? null
    )
  }, [state.runningEntries, focused_running_key])

  const select_adjacent_running_entry = (direction: -1 | 1): void => {
    const { runningEntries } = state

    if (runningEntries.length <= 1) {
      return
    }

    const current_index = runningEntries.findIndex(
      (entry) => get_running_entry_key(entry) === focused_running_key,
    )
    const index = current_index >= 0 ? current_index : 0
    const next_index =
      (index + direction + runningEntries.length) % runningEntries.length

    set_focused_running_key(get_running_entry_key(runningEntries[next_index]))
  }

  const tag_filter_mode = use_tag_filter_mode()
  const entry_list_sort = use_entry_list_sort()
  const clear_tag_filters_on_sheet_change = use_clear_tag_filters_on_sheet_change()
  const previous_active_sheet_ref = useRef<string | null>(null)

  useEffect(() => {
    if (
      !clear_tag_filters_on_sheet_change ||
      previous_active_sheet_ref.current === null ||
      previous_active_sheet_ref.current === active_sheet
    ) {
      previous_active_sheet_ref.current = active_sheet
      return
    }

    set_sheet_tag_filter(active_sheet, [])
    previous_active_sheet_ref.current = active_sheet
  }, [active_sheet, clear_tag_filters_on_sheet_change])

  const filter_tags = useSyncExternalStore(
    subscribe_sheet_tag_filters,
    () => get_sheet_tag_filter_snapshot(active_sheet),
    get_sheet_tag_filter_server_snapshot,
  )

  const sheet_tags = useMemo(
    () => collect_tags_from_entries(state.activeSheetEntries),
    [state.activeSheetEntries],
  )

  const filtered_entries = useMemo(() => {
    const matching = filter_entries_by_tags(
      state.activeSheetEntries,
      filter_tags,
      tag_filter_mode,
    )

    return sort_serialized_entries(matching, entry_list_sort)
  }, [state.activeSheetEntries, filter_tags, tag_filter_mode, entry_list_sort])

  const filtered_total_ms = useMemo(
    () => get_serialized_entries_total_ms(filtered_entries),
    [filtered_entries],
  )

  const entries_empty_message =
    filter_tags.length > 0
      ? tag_filter_mode === 'any'
        ? `No entries on sheet "${active_sheet}" match any selected tag.`
        : `No entries on sheet "${active_sheet}" match all selected tags.`
      : `No entries on sheet "${active_sheet}".`

  const edit_entry = (
    sheet_name: string,
    entry_id: number,
    values: EntryEditFormValues,
  ): Promise<TrackerState> =>
    patch_tracker_action('/api/entry', {
      sheetName: sheet_name,
      entryId: entry_id,
      ...values,
    })

  return (
    <>
      <TrackerDocumentTitle active_entry={focused_running_entry} />
      <div className="relative z-1">
        <TrackerTopbar />
        <TrackerActiveBar
          active_entry={focused_running_entry}
          running_entry_count={state.runningEntries.length}
          sheets={state.sheets}
          is_pending={is_pending}
          on_show_previous_running_entry={() => select_adjacent_running_entry(-1)}
          on_show_next_running_entry={() => select_adjacent_running_entry(1)}
          on_check_out={(at) =>
            run_action(() =>
              post_tracker_action('/api/out', {
                sheetName: focused_running_entry?.sheetName,
                ...(at !== undefined ? { at } : {}),
              }),
            )
          }
          on_delete={() =>
            run_action(() =>
              post_tracker_action('/api/entry', {
                sheetName: focused_running_entry?.sheetName,
                entryId: focused_running_entry?.id,
              }),
            )
          }
          on_edit={(values) =>
            run_action(() =>
              edit_entry(
                focused_running_entry?.sheetName ?? active_sheet,
                focused_running_entry?.id ?? 0,
                values,
              ),
            )
          }
          on_move={(target_sheet_name) =>
            run_action(() =>
              post_tracker_action('/api/entry/move', {
                sheetName: focused_running_entry?.sheetName,
                entryId: focused_running_entry?.id,
                targetSheetName: target_sheet_name,
              }),
            )
          }
          on_add_note={(text) =>
            run_action(() =>
              post_tracker_action('/api/note', {
                text,
                sheetName: focused_running_entry?.sheetName,
                entryId: focused_running_entry?.id,
              }),
            )
          }
          on_edit_note={(timestamp, text) =>
            run_action(() =>
              patch_tracker_action('/api/note', {
                sheetName: focused_running_entry?.sheetName,
                entryId: focused_running_entry?.id,
                timestamp,
                text,
              }),
            )
          }
          on_delete_note={(timestamp) =>
            run_action(() =>
              delete_tracker_action('/api/note', {
                sheetName: focused_running_entry?.sheetName,
                entryId: focused_running_entry?.id,
                timestamp,
              }),
            )
          }
        />
      </div>
      <div className="mx-auto max-w-[1120px] px-5 pb-10 pt-5">
        {error !== null ? (
          <p className="mb-4 rounded-[0.65rem] border border-danger-border bg-danger-soft px-3 py-2.5 text-danger-text">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] items-start gap-4 max-[860px]:grid-cols-1">
          <SheetSidebar
            sheets={state.sheets}
            db_path={state.dbPath}
            is_pending={is_pending}
            on_select={(name) =>
              run_action(() => post_tracker_action('/api/sheet', { name }))
            }
            on_create={(name) =>
              run_action(() => post_tracker_action('/api/sheet', { name }))
            }
            on_rename={(name, new_name) =>
              run_action(() =>
                patch_tracker_action('/api/sheet', { name, newName: new_name }),
              )
            }
            on_delete={(name) =>
              run_action(() =>
                post_tracker_action('/api/sheet', { name, delete: true }),
              )
            }
          />

          <main className="flex min-w-0 flex-col gap-4 rounded-lg border border-panel-border bg-panel p-4 shadow-sm">
            {state.activeEntry === null ? (
              <CheckInFormCollapsible
                known_tags={state.knownTags}
                is_pending={is_pending}
                on_submit={(values) =>
                  run_action(() =>
                    post_tracker_action('/api/in', {
                      ...values,
                      sheetName: active_sheet,
                    }),
                  )
                }
              />
            ) : null}

            <EntryTagFilter sheet_name={active_sheet} sheet_tags={sheet_tags} />

            <EntryList
              title="Entries"
              entries={filtered_entries}
              sheets={state.sheets}
              total_ms={filtered_total_ms}
              empty_message={entries_empty_message}
              is_pending={is_pending}
              show_sheet_name={false}
              on_delete={(entry) =>
                run_action(() =>
                  post_tracker_action('/api/entry', {
                    sheetName: entry.sheetName,
                    entryId: entry.id,
                  }),
                )
              }
              on_edit={(entry, values) =>
                run_action(() => edit_entry(entry.sheetName, entry.id, values))
              }
              on_move={(entry, target_sheet_name) =>
                run_action(() =>
                  post_tracker_action('/api/entry/move', {
                    sheetName: entry.sheetName,
                    entryId: entry.id,
                    targetSheetName: target_sheet_name,
                  }),
                )
              }
              on_move_many={(entries, target_sheet_name) =>
                run_action(() =>
                  post_tracker_action('/api/entry/move-bulk', {
                    entries: entries.map((entry) => ({
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                    })),
                    targetSheetName: target_sheet_name,
                  }),
                )
              }
              on_delete_many={(entries) =>
                run_action(() =>
                  post_tracker_action('/api/entry/delete-bulk', {
                    entries: entries.map((entry) => ({
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                    })),
                  }),
                )
              }
              on_edit_note={(entry, timestamp, text) =>
                run_action(() =>
                  patch_tracker_action('/api/note', {
                    sheetName: entry.sheetName,
                    entryId: entry.id,
                    timestamp,
                    text,
                  }),
                )
              }
              on_add_note={(entry, text) =>
                run_action(() =>
                  post_tracker_action('/api/note', {
                    sheetName: entry.sheetName,
                    entryId: entry.id,
                    text,
                  }),
                )
              }
              on_resume={(entry) =>
                run_action(() =>
                  post_tracker_action('/api/in', {
                    description: build_resume_description(
                      entry.description,
                      entry.tags,
                    ),
                    sheetName: entry.sheetName,
                  }),
                )
              }
            />
          </main>
        </div>
      </div>
    </>
  )
}
