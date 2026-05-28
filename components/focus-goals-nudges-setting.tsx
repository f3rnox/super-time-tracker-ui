'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { parse_focus_goals_by_name } from '@/lib/parse_focus_goals_by_name'
import { set_focus_goal_minutes_for_name } from '@/lib/set_focus_goal_minutes_for_name'
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
import { persist_ui_preference } from '@/lib/persist_ui_preference'
import { type FocusGoalScope } from '@/lib/types/ui_preferences'

const daily_target_minutes_options = [120, 180, 240, 300, 360, 420, 480]
const weekly_target_minutes_options = [600, 900, 1200, 1500, 1800, 2100, 2400]
const no_log_reminder_minutes_options = [15, 30, 45, 60, 90, 120]
const overwork_alert_hours_options = [6, 8, 10, 12, 14]

const scope_options: { value: FocusGoalScope; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'sheet', label: 'Per-sheet' },
  { value: 'tag', label: 'Per-tag' },
]

interface FocusGoalsNudgesSettingProps {
  sheet_names: string[]
  tag_names: string[]
}

/**
 * Setting group for focus targets and behavior nudges.
 */
export function FocusGoalsNudgesSetting({
  sheet_names,
  tag_names,
}: FocusGoalsNudgesSettingProps) {
  const is_enabled = useSyncExternalStore(
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
  const no_log_reminder_minutes = useSyncExternalStore(
    no_log_reminder_minutes_preference.subscribe,
    no_log_reminder_minutes_preference.get_snapshot,
    no_log_reminder_minutes_preference.get_server_snapshot,
  )
  const overwork_alert_hours = useSyncExternalStore(
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

  const per_sheet_map = parse_focus_goals_by_name(per_sheet_json)
  const per_tag_map = parse_focus_goals_by_name(per_tag_json)

  useEffect(() => {
    if (
      goal_scope === 'sheet' &&
      goal_sheet_name.length === 0 &&
      sheet_names.length > 0
    ) {
      persist_ui_preference(focus_goal_sheet_name_preference, sheet_names[0])
    }
  }, [goal_scope, goal_sheet_name, sheet_names])

  useEffect(() => {
    if (
      goal_scope === 'tag' &&
      goal_tag_name.length === 0 &&
      tag_names.length > 0
    ) {
      persist_ui_preference(focus_goal_tag_name_preference, tag_names[0])
    }
  }, [goal_scope, goal_tag_name, tag_names])

  const disabled = is_enabled !== 'true'

  return (
    <div id="focus-goals-nudges" className="flex w-full flex-col gap-4">
      <label className="flex w-full cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          className="shrink-0"
          checked={is_enabled === 'true'}
          onChange={(event) =>
            persist_ui_preference(
              focus_nudges_enabled_preference,
              event.target.checked ? 'true' : 'false',
            )
          }
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.95rem] font-semibold">Goals + nudges</span>
          <span className="text-[0.8rem] leading-snug text-muted">
            Track daily/weekly focus goals, overwork alerts, and no-log reminders.
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
          Focus goal scope
        </span>
        <div
          role="radiogroup"
          aria-label="Focus goal scope"
          className="inline-flex w-full flex-wrap gap-1 rounded-md border border-panel-border bg-panel p-0.5"
        >
          {scope_options.map((option) => {
            const is_selected = goal_scope === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={is_selected}
                disabled={disabled}
                className={`flex-1 min-w-24 cursor-pointer rounded px-3 py-1.5 text-[0.85rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                  is_selected
                    ? 'bg-accent-soft text-foreground'
                    : 'bg-transparent text-muted hover:bg-surface-hover hover:text-foreground'
                }`}
                onClick={() =>
                  persist_ui_preference(focus_goal_scope_preference, option.value)
                }
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {goal_scope === 'global' ? (
        <GlobalGoalEditor
          disabled={disabled}
          daily_target_minutes={daily_target_minutes}
          weekly_target_minutes={weekly_target_minutes}
        />
      ) : null}

      {goal_scope === 'sheet' ? (
        <PerNameGoalList
          kind="sheet"
          names={sheet_names}
          disabled={disabled}
          active_name={goal_sheet_name}
          map={per_sheet_map}
          json={per_sheet_json}
        />
      ) : null}

      {goal_scope === 'tag' ? (
        <PerNameGoalList
          kind="tag"
          names={tag_names}
          disabled={disabled}
          active_name={goal_tag_name}
          map={per_tag_map}
          json={per_tag_json}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
          Behavior nudges
        </span>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[0.8rem] text-muted">No-log reminder</span>
            <select
              className="rounded-md border border-panel-border bg-panel px-2.5 py-2 text-[0.85rem]"
              value={no_log_reminder_minutes}
              disabled={disabled}
              onChange={(event) =>
                persist_ui_preference(
                  no_log_reminder_minutes_preference,
                  event.target.value,
                )
              }
            >
              {no_log_reminder_minutes_options.map((value) => (
                <option key={value} value={String(value)}>
                  {value} min
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[0.8rem] text-muted">Overwork alert</span>
            <select
              className="rounded-md border border-panel-border bg-panel px-2.5 py-2 text-[0.85rem]"
              value={overwork_alert_hours}
              disabled={disabled}
              onChange={(event) =>
                persist_ui_preference(
                  overwork_alert_hours_preference,
                  event.target.value,
                )
              }
            >
              {overwork_alert_hours_options.map((value) => (
                <option key={value} value={String(value)}>
                  {value} hours
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}

interface GlobalGoalEditorProps {
  disabled: boolean
  daily_target_minutes: string
  weekly_target_minutes: string
}

/**
 * Editor for the global daily/weekly focus targets.
 */
function GlobalGoalEditor({
  disabled,
  daily_target_minutes,
  weekly_target_minutes,
}: GlobalGoalEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        Global targets
      </span>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[0.8rem] text-muted">Daily target</span>
          <select
            className="rounded-md border border-panel-border bg-panel px-2.5 py-2 text-[0.85rem]"
            value={daily_target_minutes}
            disabled={disabled}
            onChange={(event) =>
              persist_ui_preference(
                daily_focus_target_minutes_preference,
                event.target.value,
              )
            }
          >
            {daily_target_minutes_options.map((value) => (
              <option key={value} value={String(value)}>
                {value} min
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.8rem] text-muted">Weekly target</span>
          <select
            className="rounded-md border border-panel-border bg-panel px-2.5 py-2 text-[0.85rem]"
            value={weekly_target_minutes}
            disabled={disabled}
            onChange={(event) =>
              persist_ui_preference(
                weekly_focus_target_minutes_preference,
                event.target.value,
              )
            }
          >
            {weekly_target_minutes_options.map((value) => (
              <option key={value} value={String(value)}>
                {value} min
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

interface PerNameGoalListProps {
  kind: 'sheet' | 'tag'
  names: string[]
  disabled: boolean
  active_name: string
  map: ReturnType<typeof parse_focus_goals_by_name>
  json: string
}

/**
 * List of per-sheet or per-tag goal rows with active selection.
 */
function PerNameGoalList({
  kind,
  names,
  disabled,
  active_name,
  map,
  json,
}: PerNameGoalListProps) {
  const heading_label = kind === 'sheet' ? 'Per-sheet targets' : 'Per-tag targets'
  const empty_label =
    kind === 'sheet'
      ? 'Create a sheet to configure per-sheet goals.'
      : 'Add a tag to a time entry to configure per-tag goals.'

  if (names.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
          {heading_label}
        </span>
        <p className="m-0 text-[0.85rem] text-muted">{empty_label}</p>
      </div>
    )
  }

  const radio_group_name = `focus-goal-active-${kind}`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
          {heading_label}
        </span>
        <span className="text-[0.75rem] text-muted">
          Pick the {kind} shown in the focus banner.
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {names.map((name) => {
          const entry = map[name] ?? {}
          const daily_value = entry.daily ?? ''
          const weekly_value = entry.weekly ?? ''
          const is_active = active_name === name

          return (
            <li
              key={name}
              className={`grid items-center gap-2 rounded-md border bg-panel px-3 py-2.5 transition-colors md:grid-cols-[auto_minmax(0,1fr)_minmax(0,11rem)_minmax(0,11rem)] grid-cols-[auto_minmax(0,1fr)] ${
                is_active
                  ? 'border-accent-border bg-accent-soft'
                  : 'border-panel-border'
              }`}
            >
              <label className="flex shrink-0 cursor-pointer items-center justify-center">
                <input
                  type="radio"
                  name={radio_group_name}
                  className="cursor-pointer"
                  checked={is_active}
                  disabled={disabled}
                  aria-label={`Show ${name} in focus banner`}
                  onChange={() =>
                    persist_ui_preference(
                      kind === 'sheet'
                        ? focus_goal_sheet_name_preference
                        : focus_goal_tag_name_preference,
                      name,
                    )
                  }
                />
              </label>
              <span
                className="truncate text-[0.9rem] font-medium"
                title={name}
              >
                {kind === 'tag' && !name.startsWith('@') ? `@${name}` : name}
              </span>
              <label className="flex items-center gap-2 md:col-start-3">
                <span className="text-[0.75rem] text-muted">Daily</span>
                <select
                  className="flex-1 rounded-md border border-panel-border bg-panel px-2 py-1.5 text-[0.85rem]"
                  value={daily_value}
                  disabled={disabled}
                  onChange={(event) =>
                    persist_ui_preference(
                      kind === 'sheet'
                        ? focus_goals_per_sheet_preference
                        : focus_goals_per_tag_preference,
                      set_focus_goal_minutes_for_name(
                        json,
                        name,
                        'daily',
                        event.target.value,
                      ),
                    )
                  }
                >
                  <option value="">Not set</option>
                  {daily_target_minutes_options.map((value) => (
                    <option key={value} value={String(value)}>
                      {value} min
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 md:col-start-4">
                <span className="text-[0.75rem] text-muted">Weekly</span>
                <select
                  className="flex-1 rounded-md border border-panel-border bg-panel px-2 py-1.5 text-[0.85rem]"
                  value={weekly_value}
                  disabled={disabled}
                  onChange={(event) =>
                    persist_ui_preference(
                      kind === 'sheet'
                        ? focus_goals_per_sheet_preference
                        : focus_goals_per_tag_preference,
                      set_focus_goal_minutes_for_name(
                        json,
                        name,
                        'weekly',
                        event.target.value,
                      ),
                    )
                  }
                >
                  <option value="">Not set</option>
                  {weekly_target_minutes_options.map((value) => (
                    <option key={value} value={String(value)}>
                      {value} min
                    </option>
                  ))}
                </select>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
