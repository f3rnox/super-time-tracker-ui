'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { focus_nudges_enabled_preference } from '@/lib/preferences/focus_nudges_enabled_preference'
import { no_log_reminder_minutes_preference } from '@/lib/preferences/no_log_reminder_minutes_preference'
import { overwork_alert_hours_preference } from '@/lib/preferences/overwork_alert_hours_preference'
import { work_hours_end_preference } from '@/lib/preferences/work_hours_end_preference'
import { work_hours_start_preference } from '@/lib/preferences/work_hours_start_preference'

const check_interval_ms = 60_000

const parse_time_to_minutes = (value: string): number | null => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)

  if (match === null) {
    return null
  }

  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10)
}

const is_within_work_hours = (
  now: Date,
  work_hours_start: string,
  work_hours_end: string,
): boolean => {
  const start_minutes = parse_time_to_minutes(work_hours_start)
  const end_minutes = parse_time_to_minutes(work_hours_end)

  if (start_minutes === null || end_minutes === null) {
    return false
  }

  const day = now.getDay()

  if (day === 0 || day === 6) {
    return false
  }

  const current_minutes = now.getHours() * 60 + now.getMinutes()

  if (start_minutes <= end_minutes) {
    return current_minutes >= start_minutes && current_minutes < end_minutes
  }

  return current_minutes >= start_minutes || current_minutes < end_minutes
}

/**
 * Background checker for rule-based local notification reminders.
 */
export function NotificationRulesRunner() {
  const focus_nudges_enabled = useSyncExternalStore(
    focus_nudges_enabled_preference.subscribe,
    focus_nudges_enabled_preference.get_snapshot,
    focus_nudges_enabled_preference.get_server_snapshot,
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
  const work_hours_start = useSyncExternalStore(
    work_hours_start_preference.subscribe,
    work_hours_start_preference.get_snapshot,
    work_hours_start_preference.get_server_snapshot,
  )
  const work_hours_end = useSyncExternalStore(
    work_hours_end_preference.subscribe,
    work_hours_end_preference.get_snapshot,
    work_hours_end_preference.get_server_snapshot,
  )
  const last_no_timer_notification_at_ref = useRef<number>(0)
  const notified_overwork_entry_key_ref = useRef<string | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      focus_nudges_enabled !== 'true'
    ) {
      return
    }

    if (window.Notification.permission === 'default') {
      void window.Notification.requestPermission()
    }
  }, [focus_nudges_enabled])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      focus_nudges_enabled !== 'true'
    ) {
      return
    }

    const overwork_threshold_ms =
      Math.max(1, Number.parseInt(overwork_alert_hours, 10) || 1) * 60 * 60 * 1000
    const no_log_threshold_ms =
      Math.max(1, Number.parseInt(no_log_reminder_minutes, 10) || 1) * 60 * 1000

    const notify = (title: string, body: string): void => {
      if (window.Notification.permission !== 'granted') {
        return
      }

      void new window.Notification(title, { body })
    }

    const check_rules = async (): Promise<void> => {
      try {
        const response = await fetch('/api/state', { cache: 'no-store' })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          runningEntry?: {
            id: number
            sheetName: string
            description: string
            start: string
          } | null
        }
        const running_entry = payload.runningEntry
        const now = new Date()
        const now_ms = now.getTime()

        if (
          running_entry === null &&
          is_within_work_hours(now, work_hours_start, work_hours_end)
        ) {
          const elapsed_since_notice = now_ms - last_no_timer_notification_at_ref.current

          if (elapsed_since_notice >= no_log_threshold_ms) {
            notify(
              'No active timer during work hours',
              'Start tracking or check in to keep your work log current.',
            )
            last_no_timer_notification_at_ref.current = now_ms
          }
        }

        if (running_entry !== null && running_entry !== undefined) {
          const running_since_ms = Date.parse(running_entry.start)

          if (Number.isFinite(running_since_ms)) {
            const elapsed_ms = now_ms - running_since_ms
            const entry_key = `${running_entry.sheetName}-${running_entry.id}`

            if (
              elapsed_ms >= overwork_threshold_ms &&
              notified_overwork_entry_key_ref.current !== entry_key
            ) {
              notify(
                'Long-running timer detected',
                `Timer has been running for over ${overwork_alert_hours}h. Consider splitting: ${running_entry.description}`,
              )
              notified_overwork_entry_key_ref.current = entry_key
            }
          }
        } else {
          notified_overwork_entry_key_ref.current = null
        }
      } catch {
        // Ignore transient background check failures.
      }
    }

    void check_rules()
    const interval_id = window.setInterval(() => {
      void check_rules()
    }, check_interval_ms)

    return () => {
      window.clearInterval(interval_id)
    }
  }, [
    focus_nudges_enabled,
    no_log_reminder_minutes,
    overwork_alert_hours,
    work_hours_end,
    work_hours_start,
  ])

  return null
}
