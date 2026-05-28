export type PomodoroPhase = 'work' | 'short_break' | 'long_break'
export type PomodoroStatus = 'idle' | 'running' | 'paused'

export const POMODORO_STORAGE_KEY = 'super-time-tracker-pomodoro'

export const POMODORO_DEFAULT_WORK_MINUTES = 25
export const POMODORO_DEFAULT_SHORT_BREAK_MINUTES = 5
export const POMODORO_DEFAULT_LONG_BREAK_MINUTES = 15
export const POMODORO_DEFAULT_ROUNDS_BEFORE_LONG_BREAK = 4

export interface PomodoroSettings {
  work_minutes: number
  short_break_minutes: number
  long_break_minutes: number
  rounds_before_long_break: number
  auto_start_next_phase: boolean
}

export interface PomodoroTimerState {
  phase: PomodoroPhase
  status: PomodoroStatus
  completed_work_sessions: number
  deadline_at_ms: number | null
  paused_remaining_ms: number | null
}

export interface PomodoroStorageRecord {
  settings: PomodoroSettings
  state: PomodoroTimerState
}

export const POMODORO_DEFAULT_SETTINGS: PomodoroSettings = {
  work_minutes: POMODORO_DEFAULT_WORK_MINUTES,
  short_break_minutes: POMODORO_DEFAULT_SHORT_BREAK_MINUTES,
  long_break_minutes: POMODORO_DEFAULT_LONG_BREAK_MINUTES,
  rounds_before_long_break: POMODORO_DEFAULT_ROUNDS_BEFORE_LONG_BREAK,
  auto_start_next_phase: true,
}

export const POMODORO_DEFAULT_STATE: PomodoroTimerState = {
  phase: 'work',
  status: 'idle',
  completed_work_sessions: 0,
  deadline_at_ms: null,
  paused_remaining_ms: null,
}
