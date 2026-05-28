/**
 * Runtime activity snapshot used by focus goals and nudge UI.
 */
export interface FocusNudgesStatus {
  todayTrackedMs: number
  weekTrackedMs: number
  activeTimerDurationMs: number | null
  minutesSinceLastLog: number | null
}
