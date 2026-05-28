'use client'

import { useEffect, useState } from 'react'

import { TagAutocompleteInput } from '@/components/tag-autocomplete-input'
import { SettingsPageLayout } from '@/components/settings-page-layout'
import {
  POMODORO_DEFAULT_SETTINGS,
  POMODORO_DEFAULT_STATE,
  POMODORO_STORAGE_KEY,
  type PomodoroSettings,
  type PomodoroStorageRecord,
} from '@/lib/types/pomodoro'

/**
 * Settings page for Pomodoro timer durations and tracker integration behavior.
 */
export function PomodoroSettingsView({ known_tags }: { known_tags: string[] }) {
  const [settings, set_settings] = useState<PomodoroSettings>(POMODORO_DEFAULT_SETTINGS)
  const [is_hydrated, set_is_hydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const raw_value = window.localStorage.getItem(POMODORO_STORAGE_KEY)

      if (raw_value !== null) {
        const parsed_value = JSON.parse(raw_value) as Partial<PomodoroStorageRecord>
        const stored_settings = parsed_value.settings

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
      }
    } catch {
      // Ignore malformed local storage values.
    }

    set_is_hydrated(true)
  }, [])

  useEffect(() => {
    if (!is_hydrated || typeof window === "undefined") {
      return
    }

    try {
      const raw_value = window.localStorage.getItem(POMODORO_STORAGE_KEY)
      const parsed_value =
        raw_value === null
          ? {}
          : (JSON.parse(raw_value) as Partial<PomodoroStorageRecord>)

      const next_record: PomodoroStorageRecord = {
        settings,
        state: parsed_value.state ?? POMODORO_DEFAULT_STATE,
      }

      window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(next_record))
    } catch {
      // Ignore storage write failures.
    }
  }, [is_hydrated, settings])

  return (
    <SettingsPageLayout
      breadcrumb={{
        current: 'Pomodoro',
        parent: { label: 'Settings', href: '/settings' },
      }}
      title="Pomodoro"
      description="Focus and break durations, auto-start behavior, and tracker check-in defaults."
    >
      <ul
        className="m-0 grid w-full list-none grid-cols-1 gap-2 p-0 md:grid-cols-2"
        aria-label="Pomodoro settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[0.95rem] font-semibold">Work minutes</span>
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-md border border-panel-border bg-background px-3 py-2"
              value={settings.work_minutes}
              onChange={(event) => {
                set_settings((current) => ({
                  ...current,
                  work_minutes: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                }))
              }}
            />
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[0.95rem] font-semibold">Short break minutes</span>
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-md border border-panel-border bg-background px-3 py-2"
              value={settings.short_break_minutes}
              onChange={(event) => {
                set_settings((current) => ({
                  ...current,
                  short_break_minutes: Math.max(
                    1,
                    Number.parseInt(event.target.value, 10) || 1,
                  ),
                }))
              }}
            />
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[0.95rem] font-semibold">Long break minutes</span>
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-md border border-panel-border bg-background px-3 py-2"
              value={settings.long_break_minutes}
              onChange={(event) => {
                set_settings((current) => ({
                  ...current,
                  long_break_minutes: Math.max(
                    1,
                    Number.parseInt(event.target.value, 10) || 1,
                  ),
                }))
              }}
            />
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[0.95rem] font-semibold">Rounds before long break</span>
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-md border border-panel-border bg-background px-3 py-2"
              value={settings.rounds_before_long_break}
              onChange={(event) => {
                set_settings((current) => ({
                  ...current,
                  rounds_before_long_break: Math.max(
                    1,
                    Number.parseInt(event.target.value, 10) || 1,
                  ),
                }))
              }}
            />
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm md:col-span-2">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              className="mt-0.5 shrink-0"
              checked={settings.auto_start_next_phase}
              onChange={(event) => {
                set_settings((current) => ({
                  ...current,
                  auto_start_next_phase: event.target.checked,
                }))
              }}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[0.95rem] font-semibold">Auto-start next phase</span>
              <span className="text-[0.8rem] leading-snug text-muted">
                Continue automatically when a focus or break phase ends.
              </span>
            </span>
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm md:col-span-2">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              className="mt-0.5 shrink-0"
              checked={settings.check_in_on_work_start}
              onChange={(event) => {
                set_settings((current) => ({
                  ...current,
                  check_in_on_work_start: event.target.checked,
                }))
              }}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[0.95rem] font-semibold">Start tracker entry on focus start</span>
              <span className="text-[0.8rem] leading-snug text-muted">
                When you start a focus phase, create a new entry on your active sheet.
              </span>
            </span>
          </label>
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-[0.95rem] font-semibold">Focus entry description (supports @tags)</span>
            <TagAutocompleteInput
              id="pomodoro-settings-work-entry-description"
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
            <span className="text-[0.8rem] leading-snug text-muted">
              Used when a focus phase creates a new tracker entry on the active sheet.
            </span>
          </label>
        </li>
      </ul>
    </SettingsPageLayout>
  )
}
