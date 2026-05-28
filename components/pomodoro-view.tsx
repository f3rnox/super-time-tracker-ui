'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { TagAutocompleteInput } from '@/components/tag-autocomplete-input'
import { TrackerTopbar } from '@/components/tracker-topbar'
import { get_button_class_name } from '@/lib/get_button_class_name'
import {
  clear_pomodoro_task_entry_marker,
  mark_pomodoro_task_entry,
} from '@/lib/pomodoro_task_marker'
import { read_stored_active_sheet } from '@/lib/read_stored_active_sheet'
import {
  POMODORO_DEFAULT_SETTINGS,
  POMODORO_DEFAULT_STATE,
  POMODORO_STORAGE_KEY,
  type PomodoroPhase,
  type PomodoroSettings,
  type PomodoroStorageRecord,
  type PomodoroTimerState,
} from '@/lib/types/pomodoro'

/**
 * Client Pomodoro timer with configurable work and break cycles.
 */
export function PomodoroView({ known_tags }: { known_tags: string[] }) {
  const [settings, set_settings] = useState<PomodoroSettings>(
    POMODORO_DEFAULT_SETTINGS,
  )
  const [timer_state, set_timer_state] = useState<PomodoroTimerState>(
    POMODORO_DEFAULT_STATE,
  )
  const [now_ms, set_now_ms] = useState<number>(() => Date.now())
  const [is_hydrated, set_is_hydrated] = useState(false)
  const [sync_error, set_sync_error] = useState<string | null>(null)
  const [has_running_tracker_entry, set_has_running_tracker_entry] = useState(false)
  const original_title_ref = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const hydration_timeout = window.setTimeout(() => {
      try {
        const stored_value = window.localStorage.getItem(POMODORO_STORAGE_KEY)

        if (stored_value !== null) {
          const parsed_value = JSON.parse(
            stored_value,
          ) as Partial<PomodoroStorageRecord>
          const stored_settings = parsed_value.settings
          const stored_state = parsed_value.state

          if (stored_settings !== undefined) {
            set_settings({
              work_minutes:
                typeof stored_settings.work_minutes === 'number' &&
                Number.isFinite(stored_settings.work_minutes) &&
                stored_settings.work_minutes > 0
                  ? Math.round(stored_settings.work_minutes)
                  : POMODORO_DEFAULT_SETTINGS.work_minutes,
              short_break_minutes:
                typeof stored_settings.short_break_minutes === 'number' &&
                Number.isFinite(stored_settings.short_break_minutes) &&
                stored_settings.short_break_minutes > 0
                  ? Math.round(stored_settings.short_break_minutes)
                  : POMODORO_DEFAULT_SETTINGS.short_break_minutes,
              long_break_minutes:
                typeof stored_settings.long_break_minutes === 'number' &&
                Number.isFinite(stored_settings.long_break_minutes) &&
                stored_settings.long_break_minutes > 0
                  ? Math.round(stored_settings.long_break_minutes)
                  : POMODORO_DEFAULT_SETTINGS.long_break_minutes,
              rounds_before_long_break:
                typeof stored_settings.rounds_before_long_break === 'number' &&
                Number.isFinite(stored_settings.rounds_before_long_break) &&
                stored_settings.rounds_before_long_break > 0
                  ? Math.round(stored_settings.rounds_before_long_break)
                  : POMODORO_DEFAULT_SETTINGS.rounds_before_long_break,
              auto_start_next_phase:
                typeof stored_settings.auto_start_next_phase === 'boolean'
                  ? stored_settings.auto_start_next_phase
                  : POMODORO_DEFAULT_SETTINGS.auto_start_next_phase,
              check_in_on_work_start:
                typeof stored_settings.check_in_on_work_start === 'boolean'
                  ? stored_settings.check_in_on_work_start
                  : POMODORO_DEFAULT_SETTINGS.check_in_on_work_start,
              work_entry_description:
                typeof stored_settings.work_entry_description === 'string' &&
                stored_settings.work_entry_description.trim().length > 0
                  ? stored_settings.work_entry_description.trim()
                  : POMODORO_DEFAULT_SETTINGS.work_entry_description,
            })
          }

          if (stored_state !== undefined) {
            const stored_phase = stored_state.phase
            const stored_status = stored_state.status

            set_timer_state({
              phase:
                stored_phase === 'short_break' ||
                stored_phase === 'long_break' ||
                stored_phase === 'work'
                  ? stored_phase
                  : POMODORO_DEFAULT_STATE.phase,
              status:
                stored_status === 'idle' ||
                stored_status === 'paused' ||
                stored_status === 'running'
                  ? stored_status
                  : POMODORO_DEFAULT_STATE.status,
              completed_work_sessions:
                typeof stored_state.completed_work_sessions === 'number' &&
                Number.isFinite(stored_state.completed_work_sessions) &&
                stored_state.completed_work_sessions >= 0
                  ? Math.round(stored_state.completed_work_sessions)
                  : POMODORO_DEFAULT_STATE.completed_work_sessions,
              deadline_at_ms:
                typeof stored_state.deadline_at_ms === 'number' &&
                Number.isFinite(stored_state.deadline_at_ms)
                  ? stored_state.deadline_at_ms
                  : null,
              paused_remaining_ms:
                typeof stored_state.paused_remaining_ms === 'number' &&
                Number.isFinite(stored_state.paused_remaining_ms) &&
                stored_state.paused_remaining_ms >= 0
                  ? Math.round(stored_state.paused_remaining_ms)
                  : null,
            })
          }
        }
      } catch {
        // Ignore bad saved state and fall back to defaults.
      }

      set_is_hydrated(true)
    }, 0)

    return () => {
      window.clearTimeout(hydration_timeout)
    }
  }, [])

  useEffect(() => {
    if (!is_hydrated || typeof window === 'undefined') {
      return
    }

    try {
      const record: PomodoroStorageRecord = {
        settings,
        state: timer_state,
      }

      window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(record))
    } catch {
      // Ignore storage failures in private browsing.
    }
  }, [is_hydrated, settings, timer_state])

  useEffect(() => {
    if (timer_state.status !== 'running') {
      return
    }

    const timer = window.setInterval(() => {
      set_now_ms(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [timer_state.status, timer_state.deadline_at_ms])

  const get_phase_duration_ms = useCallback(
    (phase: PomodoroPhase): number => {
      switch (phase) {
        case 'work':
          return settings.work_minutes * 60_000
        case 'short_break':
          return settings.short_break_minutes * 60_000
        case 'long_break':
          return settings.long_break_minutes * 60_000
      }
    },
    [
      settings.long_break_minutes,
      settings.short_break_minutes,
      settings.work_minutes,
    ],
  )

  const build_pomodoro_entry_description = (): string =>
    settings.work_entry_description.trim()

  const has_any_running_tracker_entry = async (): Promise<boolean> => {
    const response = await fetch('/api/state', {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Failed to read tracker state')
    }

    const payload = (await response.json().catch(() => null)) as
      | { runningEntry?: { id: number } | null }
      | null
    return payload?.runningEntry !== null && payload?.runningEntry !== undefined
  }

  const refresh_running_tracker_entry_status = async (): Promise<void> => {
    try {
      set_has_running_tracker_entry(await has_any_running_tracker_entry())
    } catch {
      // Ignore transient polling failures on the Pomodoro page.
    }
  }

  const start_tracker_entry_for_pomodoro = async (): Promise<void> => {
    const description = build_pomodoro_entry_description()

    if (description.length === 0) {
      return
    }

    const has_running_entry = await has_any_running_tracker_entry()

    if (has_running_entry) {
      set_has_running_tracker_entry(true)
      return
    }

    const response = await fetch('/api/in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        sheetName: read_stored_active_sheet() ?? undefined,
      }),
    })

    if (response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { activeEntry?: { id: number; sheetName: string } | null }
        | null
      const active_entry = payload?.activeEntry

      if (active_entry !== null && active_entry !== undefined) {
        mark_pomodoro_task_entry({
          id: active_entry.id,
          sheetName: active_entry.sheetName,
        })
      }
      set_has_running_tracker_entry(true)
      return
    }

    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Failed to start tracker entry for Pomodoro')
  }

  const stop_active_tracker_entry_for_pomodoro = async (): Promise<void> => {
    const response = await fetch('/api/out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (response.ok) {
      clear_pomodoro_task_entry_marker()
      set_has_running_tracker_entry(false)
      return
    }

    const body = (await response.json().catch(() => ({}))) as { error?: string }
    const message = body.error ?? 'Failed to check out active tracker entry'

    if (message.includes('No active entry')) {
      return
    }

    throw new Error(message)
  }

  const start_timer = (): void => {
    set_sync_error(null)
    set_timer_state((current) => {
      const duration_ms =
        current.status === 'paused' && current.paused_remaining_ms !== null
          ? current.paused_remaining_ms
          : get_phase_duration_ms(current.phase)

      return {
        ...current,
        status: 'running',
        deadline_at_ms: Date.now() + duration_ms,
        paused_remaining_ms: null,
      }
    })

    const is_resuming = timer_state.status === 'paused'
    const should_check_in =
      is_resuming ||
      (timer_state.status !== 'running' &&
        timer_state.phase === 'work' &&
        settings.check_in_on_work_start)

    if (!should_check_in) {
      return
    }

    void start_tracker_entry_for_pomodoro().catch((error: unknown) => {
      set_sync_error(error instanceof Error ? error.message : String(error))
    })
  }

  const pause_timer = (): void => {
    set_sync_error(null)
    set_timer_state((current) => {
      if (current.status !== 'running' || current.deadline_at_ms === null) {
        return current
      }

      return {
        ...current,
        status: 'paused',
        deadline_at_ms: null,
        paused_remaining_ms: Math.max(0, current.deadline_at_ms - Date.now()),
      }
    })

    void stop_active_tracker_entry_for_pomodoro().catch((error: unknown) => {
        set_sync_error(error instanceof Error ? error.message : String(error))
    })
  }

  const reset_timer = (): void => {
    set_timer_state(POMODORO_DEFAULT_STATE)
    set_now_ms(Date.now())
  }

  const advance_phase = useCallback((): void => {
    set_timer_state((current) => {
      const completed_work_sessions =
        current.phase === 'work'
          ? current.completed_work_sessions + 1
          : current.completed_work_sessions
      const next_phase: PomodoroPhase =
        current.phase === 'work'
          ? completed_work_sessions % settings.rounds_before_long_break === 0
            ? 'long_break'
            : 'short_break'
          : 'work'
      const next_duration_ms = get_phase_duration_ms(next_phase)

      if (settings.auto_start_next_phase) {
        return {
          phase: next_phase,
          status: 'running',
          completed_work_sessions,
          deadline_at_ms: Date.now() + next_duration_ms,
          paused_remaining_ms: null,
        }
      }

      return {
        phase: next_phase,
        status: 'idle',
        completed_work_sessions,
        deadline_at_ms: null,
        paused_remaining_ms: null,
      }
    })
  }, [
    get_phase_duration_ms,
    settings.auto_start_next_phase,
    settings.rounds_before_long_break,
  ])

  useEffect(() => {
    void refresh_running_tracker_entry_status()
  }, [])

  useEffect(() => {
    const interval_id = window.setInterval(() => {
      void refresh_running_tracker_entry_status()
    }, 5000)

    return () => {
      window.clearInterval(interval_id)
    }
  }, [])

  useEffect(() => {
    if (
      timer_state.status !== 'running' ||
      timer_state.deadline_at_ms === null ||
      now_ms < timer_state.deadline_at_ms
    ) {
      return
    }

    const transition_timeout = window.setTimeout(() => {
      advance_phase()
    }, 0)

    return () => {
      window.clearTimeout(transition_timeout)
    }
  }, [advance_phase, now_ms, timer_state.deadline_at_ms, timer_state.status])

  const current_duration_ms = get_phase_duration_ms(timer_state.phase)
  const remaining_ms =
    timer_state.status === 'running' && timer_state.deadline_at_ms !== null
      ? Math.max(0, timer_state.deadline_at_ms - now_ms)
      : timer_state.status === 'paused'
        ? timer_state.paused_remaining_ms ?? current_duration_ms
        : current_duration_ms
  const progress_percent = Math.min(
    100,
    Math.max(0, ((current_duration_ms - remaining_ms) / current_duration_ms) * 100),
  )
  const countdown_label = `${Math.floor(remaining_ms / 60_000)
    .toString()
    .padStart(2, '0')}:${Math.floor((remaining_ms % 60_000) / 1000)
    .toString()
    .padStart(2, '0')}`
  const phase_label = {
    work: 'Focus',
    short_break: 'Short break',
    long_break: 'Long break',
  }[timer_state.phase]
  const next_phase =
    timer_state.phase === 'work'
      ? timer_state.completed_work_sessions % settings.rounds_before_long_break ===
        settings.rounds_before_long_break - 1
        ? 'long_break'
        : 'short_break'
      : 'work'
  const next_phase_label = {
    work: 'Focus',
    short_break: 'Short break',
    long_break: 'Long break',
  }[next_phase]
  const phase_subtitle =
    timer_state.phase === 'work'
      ? `${timer_state.completed_work_sessions + 1} / ${settings.rounds_before_long_break} focus rounds`
      : timer_state.phase === 'short_break'
        ? 'Recover before the next focus block.'
        : 'Take the long break before the next round.'
  const action_label =
    timer_state.status === 'running'
      ? 'Pause'
      : timer_state.status === 'paused'
        ? 'Resume'
        : 'Start'
  const title_label = `${countdown_label} · ${phase_label} · Pomodoro`

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    if (original_title_ref.current === null) {
      original_title_ref.current = document.title
    }

    return () => {
      if (original_title_ref.current !== null) {
        document.title = original_title_ref.current
      }
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.title = title_label
  }, [title_label])

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: 'Pomodoro' }} />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pb-12 pt-6">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">Pomodoro</h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            Keep a simple focus cycle running alongside your time tracker.
          </p>
        </header>

        <section className="rounded-md border border-panel-border bg-panel p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
                  Current phase
                </p>
                <p className="m-0 mt-1 text-[1.3rem] font-semibold">{phase_label}</p>
                <p className="m-0 mt-1 text-[0.88rem] leading-relaxed text-muted">
                  {phase_subtitle}
                </p>
              </div>

              <div className="text-right">
                <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
                  Next phase
                </p>
                <p className="m-0 mt-1 text-[0.95rem] font-semibold text-accent">
                  {next_phase_label}
                </p>
                <p className="m-0 mt-1 text-[0.84rem] text-muted">
                  {settings.auto_start_next_phase ? 'Auto-start enabled' : 'Waiting for you'}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-panel-border bg-background px-4 py-5 text-center">
              <p
                className="m-0 font-mono text-[3rem] font-semibold tracking-tight text-accent"
                aria-live="polite"
              >
                {countdown_label}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-200"
                  style={{ width: `${progress_percent}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[0.82rem] text-muted">
                <span>{timer_state.completed_work_sessions} focus sessions done</span>
                <span>•</span>
                <span>
                  {timer_state.status === 'running'
                    ? 'Running'
                    : timer_state.status === 'paused'
                      ? 'Paused'
                      : 'Idle'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={get_button_class_name('primary')}
                onClick={() => {
                  if (timer_state.status === 'running') {
                    pause_timer()
                    return
                  }

                  start_timer()
                }}
              >
                {action_label}
              </button>
              <button
                type="button"
                className={get_button_class_name('ghost')}
                onClick={advance_phase}
              >
                Skip phase
              </button>
              <button
                type="button"
                className={get_button_class_name('ghost')}
                onClick={reset_timer}
              >
                Reset
              </button>
              <Link
                href="/settings/pomodoro"
                className={`${get_button_class_name('ghost')} inline-flex items-center no-underline`}
              >
                Pomodoro settings
              </Link>
            </div>
            {sync_error !== null ? (
              <p className="m-0 text-[0.82rem] text-danger">{sync_error}</p>
            ) : null}
            {settings.check_in_on_work_start && !has_running_tracker_entry ? (
              <div className="grid gap-2 rounded-md border border-panel-border bg-background p-3 md:grid-cols-2">
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[0.8rem] font-semibold text-muted">
                    New entry description (supports @tags)
                  </span>
                  <TagAutocompleteInput
                    id="pomodoro-work-entry-description"
                    value={settings.work_entry_description}
                    known_tags={known_tags}
                    placeholder="Pomodoro focus @pomodoro @focus"
                    on_change={(value) => {
                      set_settings((current) => ({
                        ...current,
                        work_entry_description: value,
                      }))
                    }}
                  />
                </label>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </>
  )
}
