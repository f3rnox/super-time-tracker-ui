'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { SettingsIcon } from '@/components/settings-icon'
import { format_duration } from '@/lib/format_duration'
import { parse_focus_goals_by_name } from '@/lib/parse_focus_goals_by_name'
import { daily_focus_target_minutes_preference } from '@/lib/preferences/daily_focus_target_minutes_preference'
import { focus_goal_scope_preference } from '@/lib/preferences/focus_goal_scope_preference'
import { focus_goal_sheet_name_preference } from '@/lib/preferences/focus_goal_sheet_name_preference'
import { focus_goal_tag_name_preference } from '@/lib/preferences/focus_goal_tag_name_preference'
import { focus_goals_per_sheet_preference } from '@/lib/preferences/focus_goals_per_sheet_preference'
import { focus_goals_per_tag_preference } from '@/lib/preferences/focus_goals_per_tag_preference'
import { focus_nudges_enabled_preference } from '@/lib/preferences/focus_nudges_enabled_preference'
import { no_log_reminder_minutes_preference } from '@/lib/preferences/no_log_reminder_minutes_preference'
import { overwork_alert_hours_preference } from '@/lib/preferences/overwork_alert_hours_preference'
import { weekly_focus_target_minutes_preference } from '@/lib/preferences/weekly_focus_target_minutes_preference'
import {
  POMODORO_STORAGE_KEY,
  type PomodoroStorageRecord,
} from '@/lib/types/pomodoro'
import { use_duration_format } from '@/lib/use_duration_format'
import { type DurationFormat, type FocusGoalScope } from '@/lib/types/ui_preferences'
import { type FocusNudgesStatus } from '@/lib/types/focus_nudges_status'

const one_minute_ms = 60000
const one_hour_ms = 3600000
const refresh_interval_ms = 60000
const pomodoro_refresh_interval_ms = 1000

type BannerContent =
  | {
      kind: 'alert'
      tone: 'warning' | 'success' | 'info'
      title: string
      detail: string
      show_check_in_shortcut?: boolean
    }
  | {
      kind: 'progress'
      scope: 'daily' | 'weekly'
      title: string
      tracked_ms: number
      target_ms: number
    }

interface FocusGoalsNudgesBannerProps {
  on_check_in_shortcut?: () => void
  has_running_timer?: boolean
}

interface ActivePomodoroDetails {
  phase_label: string
  remaining_label: string
}

/**
 * Inline tracker banner for focus goals and behavior nudges.
 */
export function FocusGoalsNudgesBanner({
  on_check_in_shortcut,
  has_running_timer = false,
}: FocusGoalsNudgesBannerProps) {
  const duration_format = use_duration_format()
  const nudges_enabled = useSyncExternalStore(
    focus_nudges_enabled_preference.subscribe,
    focus_nudges_enabled_preference.get_snapshot,
    focus_nudges_enabled_preference.get_server_snapshot,
  )
  const daily_target_minutes = useSyncExternalStore(
    daily_focus_target_minutes_preference.subscribe,
    daily_focus_target_minutes_preference.get_snapshot,
    daily_focus_target_minutes_preference.get_server_snapshot,
  )
  const weekly_target_minutes = useSyncExternalStore(
    weekly_focus_target_minutes_preference.subscribe,
    weekly_focus_target_minutes_preference.get_snapshot,
    weekly_focus_target_minutes_preference.get_server_snapshot,
  )
  const reminder_minutes = useSyncExternalStore(
    no_log_reminder_minutes_preference.subscribe,
    no_log_reminder_minutes_preference.get_snapshot,
    no_log_reminder_minutes_preference.get_server_snapshot,
  )
  const overwork_hours = useSyncExternalStore(
    overwork_alert_hours_preference.subscribe,
    overwork_alert_hours_preference.get_snapshot,
    overwork_alert_hours_preference.get_server_snapshot,
  )
  const goal_scope = useSyncExternalStore(
    focus_goal_scope_preference.subscribe,
    focus_goal_scope_preference.get_snapshot,
    focus_goal_scope_preference.get_server_snapshot,
  )
  const goal_sheet_name = useSyncExternalStore(
    focus_goal_sheet_name_preference.subscribe,
    focus_goal_sheet_name_preference.get_snapshot,
    focus_goal_sheet_name_preference.get_server_snapshot,
  )
  const goal_tag_name = useSyncExternalStore(
    focus_goal_tag_name_preference.subscribe,
    focus_goal_tag_name_preference.get_snapshot,
    focus_goal_tag_name_preference.get_server_snapshot,
  )
  const per_sheet_json = useSyncExternalStore(
    focus_goals_per_sheet_preference.subscribe,
    focus_goals_per_sheet_preference.get_snapshot,
    focus_goals_per_sheet_preference.get_server_snapshot,
  )
  const per_tag_json = useSyncExternalStore(
    focus_goals_per_tag_preference.subscribe,
    focus_goals_per_tag_preference.get_snapshot,
    focus_goals_per_tag_preference.get_server_snapshot,
  )
  const [status, set_status] = useState<FocusNudgesStatus | null>(null)
  const [active_pomodoro, set_active_pomodoro] =
    useState<ActivePomodoroDetails | null>(null)

  useEffect(() => {
    const read_active_pomodoro = (): ActivePomodoroDetails | null => {
      try {
        const raw_value = window.localStorage.getItem(POMODORO_STORAGE_KEY)

        if (raw_value === null) {
          return null
        }

        const parsed = JSON.parse(raw_value) as Partial<PomodoroStorageRecord>
        const timer_state = parsed.state

        if (
          timer_state === undefined ||
          timer_state.status !== 'running' ||
          timer_state.deadline_at_ms === null
        ) {
          return null
        }

        const remaining_ms = Math.max(0, timer_state.deadline_at_ms - Date.now())
        const minutes = Math.floor(remaining_ms / one_minute_ms)
        const seconds = Math.floor((remaining_ms % one_minute_ms) / 1000)
        const phase_label =
          timer_state.phase === 'work'
            ? 'Focus'
            : timer_state.phase === 'short_break'
              ? 'Short break'
              : 'Long break'

        return {
          phase_label,
          remaining_label: `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`,
        }
      } catch {
        return null
      }
    }

    set_active_pomodoro(read_active_pomodoro())
    const interval_id = window.setInterval(() => {
      set_active_pomodoro(read_active_pomodoro())
    }, pomodoro_refresh_interval_ms)

    return () => {
      window.clearInterval(interval_id)
    }
  }, [])

  useEffect(() => {
    if (nudges_enabled !== 'true') {
      return
    }

    let is_cancelled = false

    const refresh_status = async (): Promise<void> => {
      try {
        const query = new URLSearchParams()
        query.set('scope', resolve_goal_scope(goal_scope, goal_sheet_name, goal_tag_name))
        if (goal_scope === 'sheet' && goal_sheet_name.length > 0) {
          query.set('sheet', goal_sheet_name)
        }
        if (goal_scope === 'tag' && goal_tag_name.length > 0) {
          query.set('tag', goal_tag_name)
        }
        const response = await fetch(`/api/focus-nudges/status?${query.toString()}`)
        if (!response.ok) {
          return
        }

        const next_status = (await response.json()) as FocusNudgesStatus

        if (!is_cancelled) {
          set_status(next_status)
        }
      } catch {
        // Ignore transient fetch failures.
      }
    }

    void refresh_status()
    const interval_id = window.setInterval(() => {
      void refresh_status()
    }, refresh_interval_ms)

    return () => {
      is_cancelled = true
      window.clearInterval(interval_id)
    }
  }, [nudges_enabled, goal_scope, goal_sheet_name, goal_tag_name])

  const content = useMemo<BannerContent | null>(() => {
    if (nudges_enabled !== 'true' || status === null) {
      return null
    }

    const { daily_minutes: resolved_daily, weekly_minutes: resolved_weekly } =
      resolve_target_minutes({
        scope: goal_scope,
        sheet_name: goal_sheet_name,
        tag_name: goal_tag_name,
        per_sheet_json,
        per_tag_json,
        global_daily: daily_target_minutes,
        global_weekly: weekly_target_minutes,
      })
    if (resolved_daily === null || resolved_weekly === null) {
      return {
        kind: 'alert',
        tone: 'info',
        title: get_goal_title('daily', goal_scope, goal_sheet_name, goal_tag_name),
        detail: 'No goals configured yet for this scope. Set daily and weekly targets in Goal settings.',
      }
    }
    const daily_target_ms = Number.parseInt(resolved_daily, 10) * one_minute_ms
    const weekly_target_ms = Number.parseInt(resolved_weekly, 10) * one_minute_ms
    const overwork_alert_ms = Number.parseInt(overwork_hours, 10) * one_hour_ms
    const no_log_reminder_threshold = Number.parseInt(reminder_minutes, 10)

    if (
      status.activeTimerDurationMs !== null &&
      status.activeTimerDurationMs >= overwork_alert_ms
    ) {
      return {
        kind: 'alert',
        tone: 'warning',
        title: 'Overwork alert',
        detail: `Current session is ${format_duration(status.activeTimerDurationMs, duration_format)}. Consider a short break.`,
      }
    }

    if (
      !has_running_timer &&
      status.minutesSinceLastLog !== null &&
      status.minutesSinceLastLog >= no_log_reminder_threshold
    ) {
      return {
        kind: 'alert',
        tone: 'warning',
        title: 'Gentle reminder',
        detail: `No time logged for ${status.minutesSinceLastLog} min. Start a timer when you are back on task.`,
        show_check_in_shortcut: true,
      }
    }

    if (status.todayTrackedMs < daily_target_ms) {
      return {
        kind: 'progress',
        scope: 'daily',
        title: get_goal_title('daily', goal_scope, goal_sheet_name, goal_tag_name),
        tracked_ms: status.todayTrackedMs,
        target_ms: daily_target_ms,
      }
    }

    if (status.weekTrackedMs < weekly_target_ms) {
      return {
        kind: 'progress',
        scope: 'weekly',
        title: get_goal_title('weekly', goal_scope, goal_sheet_name, goal_tag_name),
        tracked_ms: status.weekTrackedMs,
        target_ms: weekly_target_ms,
      }
    }

    return {
      kind: 'alert',
      tone: 'success',
      title: 'Targets met',
      detail: 'Daily and weekly focus goals are on track.',
    }
  }, [
    daily_target_minutes,
    duration_format,
    nudges_enabled,
    overwork_hours,
    has_running_timer,
    goal_scope,
    goal_sheet_name,
    goal_tag_name,
    per_sheet_json,
    per_tag_json,
    reminder_minutes,
    status,
    weekly_target_minutes,
  ])

  if (content === null) {
    return null
  }

  if (content.kind === 'progress') {
    return (
      <FocusProgressCard
        scope={content.scope}
        title={content.title}
        tracked_ms={content.tracked_ms}
        target_ms={content.target_ms}
        duration_format={duration_format}
        active_pomodoro={active_pomodoro}
      />
    )
  }

  const alert_class =
    content.tone === 'warning'
      ? 'mb-4 rounded-md border border-danger-border bg-danger-soft px-3 py-2.5 text-danger-text'
      : content.tone === 'success'
        ? 'mb-4 rounded-md border border-accent-border bg-accent-soft px-3 py-2.5 text-accent'
        : 'mb-4 rounded-md border border-panel-border bg-panel px-3 py-2.5 text-foreground'

  return (
    <section className={alert_class} aria-live="polite" aria-atomic="true">
      <p className="m-0 text-[0.85rem] font-semibold">{content.title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="m-0 text-[0.82rem] leading-relaxed">{content.detail}</p>
        {content.show_check_in_shortcut && on_check_in_shortcut !== undefined ? (
          <button
            type="button"
            className="cursor-pointer rounded border border-current bg-transparent px-2 py-1 text-[0.75rem] font-semibold"
            onClick={on_check_in_shortcut}
          >
            Check in
          </button>
        ) : null}
      </div>
    </section>
  )
}

interface ResolveTargetMinutesArgs {
  scope: FocusGoalScope
  sheet_name: string
  tag_name: string
  per_sheet_json: string
  per_tag_json: string
  global_daily: string
  global_weekly: string
}

interface ResolvedTargetMinutes {
  daily_minutes: string | null
  weekly_minutes: string | null
}

/**
 * Picks daily/weekly target minutes based on the active goal scope.
 */
function resolve_target_minutes(
  args: ResolveTargetMinutesArgs,
): ResolvedTargetMinutes {
  if (args.scope === 'sheet' && args.sheet_name.length > 0) {
    const entry = parse_focus_goals_by_name(args.per_sheet_json)[args.sheet_name]

    if (entry === undefined) {
      return {
        daily_minutes: null,
        weekly_minutes: null,
      }
    }

    return {
      daily_minutes: entry.daily ?? args.global_daily,
      weekly_minutes: entry.weekly ?? args.global_weekly,
    }
  }

  if (args.scope === 'tag' && args.tag_name.length > 0) {
    const entry = parse_focus_goals_by_name(args.per_tag_json)[args.tag_name]

    if (entry === undefined) {
      return {
        daily_minutes: null,
        weekly_minutes: null,
      }
    }

    return {
      daily_minutes: entry.daily ?? args.global_daily,
      weekly_minutes: entry.weekly ?? args.global_weekly,
    }
  }

  return {
    daily_minutes: args.global_daily,
    weekly_minutes: args.global_weekly,
  }
}

function resolve_goal_scope(
  goal_scope: FocusGoalScope,
  goal_sheet_name: string,
  goal_tag_name: string,
): FocusGoalScope {
  if (goal_scope === 'sheet' && goal_sheet_name.length === 0) {
    return 'global'
  }

  if (goal_scope === 'tag' && goal_tag_name.length === 0) {
    return 'global'
  }

  return goal_scope
}

function get_goal_title(
  period: 'daily' | 'weekly',
  goal_scope: FocusGoalScope,
  goal_sheet_name: string,
  goal_tag_name: string,
): string {
  const base = period === 'daily' ? 'Relevant goal' : 'Weekly goal'

  if (goal_scope === 'sheet' && goal_sheet_name.length > 0) {
    return `${base} · ${goal_sheet_name}`
  }

  if (goal_scope === 'tag' && goal_tag_name.length > 0) {
    return `${base} · @${goal_tag_name}`
  }

  return base
}

interface FocusProgressCardProps {
  scope: 'daily' | 'weekly'
  title: string
  tracked_ms: number
  target_ms: number
  duration_format: DurationFormat
  active_pomodoro: ActivePomodoroDetails | null
}

/**
 * Compact progress card for daily and weekly focus targets.
 */
function FocusProgressCard({
  scope,
  title,
  tracked_ms,
  target_ms,
  duration_format,
  active_pomodoro,
}: FocusProgressCardProps) {
  const percent = target_ms > 0 ? Math.min(100, (tracked_ms / target_ms) * 100) : 0
  const remaining_ms = Math.max(0, target_ms - tracked_ms)
  const scope_label = scope === 'daily' ? 'today' : 'this week'

  return (
    <section
      className="mb-4 rounded-md border border-panel-border bg-panel px-4 py-3 shadow-sm"
      aria-label={title}
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
          {title}
        </p>
        <div className="flex items-center gap-3">
          {active_pomodoro !== null ? (
            <p className="m-0 rounded border border-panel-border bg-surface-raised px-2 py-1 font-mono text-[0.72rem] font-semibold text-accent">
              Pomodoro {active_pomodoro.phase_label} · {active_pomodoro.remaining_label}
            </p>
          ) : null}
          {scope === 'daily' ? (
            <Link
              href="/settings/goals#focus-goals-nudges"
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-panel-border text-muted no-underline hover:bg-surface-hover hover:text-foreground"
              aria-label="Open daily focus target settings"
              title="Daily focus target settings"
            >
              <SettingsIcon />
            </Link>
          ) : null}
          <p className="m-0 font-mono text-[0.78rem] font-semibold text-accent">
            {Math.round(percent)}%
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="m-0 font-mono text-[1.35rem] font-semibold leading-none text-foreground">
          {format_duration(tracked_ms, duration_format)}
          <span className="ml-1 text-[0.85rem] font-medium text-muted">
            / {format_duration(target_ms, duration_format)}
          </span>
        </p>
        <p className="m-0 text-[0.78rem] text-muted">
          {format_duration(remaining_ms, duration_format)} left {scope_label}
        </p>
      </div>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-accent-soft"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  )
}
