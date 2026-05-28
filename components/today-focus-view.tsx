'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { ActiveEntryPanel } from '@/components/active-entry-panel'
import { type EntryEditFormValues } from '@/components/entry-edit-form'
import { format_time } from '@/components/format_time'
import { TodayScopeControls } from '@/components/today-scope-controls'
import { TrackerTopbar } from '@/components/tracker-topbar'
import { delete_tracker_action } from '@/lib/delete_tracker_action'
import { filter_today_focus_by_sheet_names } from '@/lib/filter_today_focus_by_sheet_names'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { finish_running_pomodoro_timer } from '@/lib/finish_running_pomodoro_timer'
import { navigate_to_tracker_sheet } from '@/lib/navigate_to_tracker_sheet'
import { patch_tracker_action } from '@/lib/patch_tracker_action'
import { post_tracker_action } from '@/lib/post_tracker_action'
import { today_scope_preference } from '@/lib/preferences/today_scope_preference'
import {
  get_pinned_sheet_names_server_snapshot,
  get_pinned_sheet_names_snapshot,
  subscribe_pinned_sheet_names,
} from '@/lib/pinned_sheet_names_store'
import { toggle_pinned_sheet_name } from '@/lib/toggle_pinned_sheet_name'
import { use_duration_format } from '@/lib/use_duration_format'
import { use_time_format } from '@/lib/use_time_format'
import {
  type TodayFocusEntry,
  type TodayFocusPageData,
} from '@/lib/types/today_focus'

interface TodayFocusViewProps {
  initial_data: TodayFocusPageData
}

const tag_item_class =
  'rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text'

/**
 * Minimal today view with running timers and today's entries.
 */
export function TodayFocusView({ initial_data }: TodayFocusViewProps) {
  const router = useRouter()
  const duration_format = use_duration_format()
  const time_format = use_time_format()
  const [data, set_data] = useState(initial_data)
  const [error, set_error] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)

  useEffect(() => {
    set_data(initial_data)
  }, [initial_data])

  const scope = useSyncExternalStore(
    today_scope_preference.subscribe,
    today_scope_preference.get_snapshot,
    today_scope_preference.get_server_snapshot,
  )
  const pinned_names = useSyncExternalStore(
    subscribe_pinned_sheet_names,
    get_pinned_sheet_names_snapshot,
    get_pinned_sheet_names_server_snapshot,
  )

  const allowed_sheet_names = useMemo(() => {
    if (scope === 'all') {
      return null
    }

    return new Set(pinned_names)
  }, [scope, pinned_names])

  const visible_running = useMemo(() => {
    if (allowed_sheet_names === null) {
      return data.runningEntries
    }

    return data.runningEntries.filter((entry) =>
      allowed_sheet_names.has(entry.sheetName),
    )
  }, [allowed_sheet_names, data.runningEntries])

  const visible_entries = useMemo(() => {
    if (allowed_sheet_names === null) {
      return data.todayEntries
    }

    return filter_today_focus_by_sheet_names(
      data.todayEntries,
      allowed_sheet_names,
    )
  }, [allowed_sheet_names, data.todayEntries])

  const visible_total_ms = useMemo(
    () =>
      visible_entries.reduce((total, entry) => total + entry.todayDurationMs, 0),
    [visible_entries],
  )

  const run_action = async (
    action: () => Promise<unknown>,
  ): Promise<void> => {
    set_is_pending(true)
    set_error(null)

    try {
      await action()
      router.refresh()
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

  const edit_entry = (
    sheet_name: string,
    entry_id: number,
    values: EntryEditFormValues,
  ) =>
    patch_tracker_action('/api/entry', {
      sheetName: sheet_name,
      entryId: entry_id,
      ...values,
    })

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: 'Today' }} />
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 pb-12 pt-6">
        <header className="flex w-full flex-col gap-2 text-center">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">Today</h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            Running timers and time logged today.
          </p>
        </header>

        {error !== null ? (
          <p className="m-0 w-full rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-[0.85rem] text-danger">
            {error}
          </p>
        ) : null}

        <TodayScopeControls
          sheet_names={data.sheetNames}
          on_toggle_pin={toggle_pinned_sheet_name}
        />

        <section
          className="w-full rounded-md border border-panel-border bg-panel p-4 shadow-sm"
          aria-label="Today total"
        >
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Tracked today
            {scope === 'pinned' ? ' (pinned)' : ''}
          </p>
          <p className="m-0 mt-1 font-mono text-[1.75rem] font-semibold text-accent">
            {format_duration(visible_total_ms, duration_format)}
          </p>
        </section>

        {visible_running.length > 0 ? (
          <section className="flex w-full flex-col gap-3" aria-label="Running timers">
            <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
              Running
            </h2>
            {visible_running.map((entry) => (
              <div
                key={`${entry.sheetName}-${entry.id}`}
                className="rounded-md border border-panel-border bg-panel p-4 shadow-sm"
              >
                <p className="m-0 mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
                  {entry.sheetName}
                </p>
                <ActiveEntryPanel
                  entry={entry}
                  sheets={data.sheets}
                  known_tags={data.knownTags}
                  in_bar
                  is_pending={is_pending}
                  on_check_out={(at) =>
                    void run_action(async () => {
                      await post_tracker_action('/api/out', {
                        sheetName: entry.sheetName,
                        ...(at !== undefined ? { at } : {}),
                      })
                      finish_running_pomodoro_timer()
                    })
                  }
                  on_delete={() =>
                    void run_action(() =>
                      post_tracker_action('/api/entry', {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                      }),
                    )
                  }
                  on_edit={(values) =>
                    void run_action(() =>
                      edit_entry(entry.sheetName, entry.id, values),
                    )
                  }
                  on_move={(target_sheet_name) =>
                    void run_action(() =>
                      post_tracker_action('/api/entry/move', {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                        targetSheetName: target_sheet_name,
                      }),
                    )
                  }
                  on_add_note={(text, at) =>
                    void run_action(() =>
                      post_tracker_action('/api/note', {
                        text,
                        ...(at !== undefined ? { at } : {}),
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                      }),
                    )
                  }
                  on_edit_note={(timestamp, text) =>
                    void run_action(() =>
                      patch_tracker_action('/api/note', {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                        timestamp,
                        text,
                      }),
                    )
                  }
                  on_delete_note={(timestamp) =>
                    void run_action(() =>
                      delete_tracker_action('/api/note', {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                        timestamp,
                      }),
                    )
                  }
                />
              </div>
            ))}
          </section>
        ) : null}

        <section className="flex w-full flex-col gap-3" aria-label="Today's entries">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
              Today&apos;s entries
            </h2>
            <span className="text-[0.8rem] text-muted">
              {visible_entries.length === 0
                ? 'None'
                : visible_entries.length === 1
                  ? '1 entry'
                  : `${visible_entries.length} entries`}
            </span>
          </div>

          {visible_entries.length === 0 ? (
            <p className="m-0 text-[0.9rem] text-muted">
              {scope === 'pinned' && pinned_names.length === 0
                ? 'Pin at least one sheet to see today’s activity.'
                : 'No time logged today for the selected scope.'}
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {visible_entries.map((entry) => (
                <TodayEntryRow
                  key={`${entry.sheetName}-${entry.id}`}
                  entry={entry}
                  duration_format={duration_format}
                  time_format={time_format}
                  show_sheet_name={scope === 'all' || pinned_names.length > 1}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}

interface TodayEntryRowProps {
  entry: TodayFocusEntry
  duration_format: import('@/lib/types/ui_preferences').DurationFormat
  time_format: import('@/lib/types/ui_preferences').TimeFormat
  show_sheet_name: boolean
}

/**
 * Compact row for a single today entry.
 */
function TodayEntryRow({
  entry,
  duration_format,
  time_format,
  show_sheet_name,
}: TodayEntryRowProps) {
  const start_label = format_time(entry.start, time_format)
  const end_label =
    entry.end === null ? 'now' : format_time(entry.end, time_format)

  return (
    <li className="rounded-md border border-panel-border bg-panel px-3.5 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {show_sheet_name ? (
            <p className="m-0 mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
              {entry.sheetName}
            </p>
          ) : null}
          <p className="m-0 text-[0.95rem] font-medium">{entry.description}</p>
          <p className="m-0 mt-1 text-[0.8rem] text-muted">
            {start_label} → {end_label}
          </p>
          {entry.tags.length > 0 ? (
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
              {entry.tags.map((tag) => (
                <li key={tag} className={tag_item_class}>
                  {format_display_tag(tag)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[0.9rem] font-semibold text-accent">
            {format_duration(entry.todayDurationMs, duration_format)}
          </span>
          <Link
            href="/"
            className="text-[0.8rem] font-semibold text-accent no-underline hover:underline"
            onClick={() => navigate_to_tracker_sheet(entry.sheetName)}
          >
            Open sheet
          </Link>
        </div>
      </div>
    </li>
  )
}
