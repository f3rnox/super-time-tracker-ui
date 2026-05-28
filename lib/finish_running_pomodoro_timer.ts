'use client'

import {
  POMODORO_DEFAULT_SETTINGS,
  POMODORO_DEFAULT_STATE,
  POMODORO_STORAGE_KEY,
  type PomodoroStorageRecord,
} from '@/lib/types/pomodoro'

/**
 * Stops a running Pomodoro timer and resets it to idle.
 */
export function finish_running_pomodoro_timer(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const raw_value = window.localStorage.getItem(POMODORO_STORAGE_KEY)

    if (raw_value === null) {
      return
    }

    const parsed_value = JSON.parse(raw_value) as Partial<PomodoroStorageRecord>
    const stored_state = parsed_value.state

    if (stored_state?.status !== 'running') {
      return
    }

    const next_record: PomodoroStorageRecord = {
      settings: parsed_value.settings ?? POMODORO_DEFAULT_SETTINGS,
      state: POMODORO_DEFAULT_STATE,
    }

    window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(next_record))
  } catch {
    // Ignore malformed or unavailable localStorage.
  }
}
