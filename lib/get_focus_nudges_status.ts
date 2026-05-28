import { get_clipped_entry_duration_ms } from '@/lib/get_clipped_entry_duration_ms'
import { get_period_range_ms } from '@/lib/get_period_range_ms'
import { read_db } from '@/lib/read_db'
import { type FocusGoalScope } from '@/lib/types/ui_preferences'
import { type FocusNudgesStatus } from '@/lib/types/focus_nudges_status'

interface FocusNudgesStatusArgs {
  scope?: FocusGoalScope
  sheet_name?: string
  tag_name?: string
}

/**
 * Builds the current status used for focus goals and reminder nudges.
 */
export async function get_focus_nudges_status({
  scope = 'global',
  sheet_name,
  tag_name,
}: FocusNudgesStatusArgs = {}): Promise<FocusNudgesStatus> {
  const db = await read_db()
  const now_ms = Date.now()
  const reference = new Date(now_ms)
  const today_range = get_period_range_ms('today', reference)
  const week_range = get_period_range_ms('week', reference)

  let today_tracked_ms = 0
  let week_tracked_ms = 0
  let active_timer_duration_ms: number | null = null
  let last_log_ms: number | null = null

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      const matches_scope =
        scope === 'global' ||
        (scope === 'sheet' && sheet_name !== undefined && sheet.name === sheet_name) ||
        (scope === 'tag' &&
          tag_name !== undefined &&
          entry.tags.some((tag) => tag === tag_name))

      if (matches_scope) {
        today_tracked_ms += get_clipped_entry_duration_ms(
          entry,
          today_range.startMs,
          today_range.endMs,
          now_ms,
        )
        week_tracked_ms += get_clipped_entry_duration_ms(
          entry,
          week_range.startMs,
          week_range.endMs,
          now_ms,
        )
      }

      const entry_start_ms = +entry.start
      const entry_end_ms = entry.end === null ? null : +entry.end
      const entry_last_log_ms =
        entry_end_ms === null
          ? entry_start_ms
          : Math.max(entry_start_ms, entry_end_ms)

      if (last_log_ms === null || entry_last_log_ms > last_log_ms) {
        last_log_ms = entry_last_log_ms
      }

      if (entry.end === null) {
        const duration_ms = Math.max(0, now_ms - entry_start_ms)

        if (active_timer_duration_ms === null || duration_ms > active_timer_duration_ms) {
          active_timer_duration_ms = duration_ms
        }
      }
    }
  }

  const minutes_since_last_log =
    active_timer_duration_ms !== null || last_log_ms === null
      ? null
      : Math.floor((now_ms - last_log_ms) / 60000)

  return {
    todayTrackedMs: today_tracked_ms,
    weekTrackedMs: week_tracked_ms,
    activeTimerDurationMs: active_timer_duration_ms,
    minutesSinceLastLog: minutes_since_last_log,
  }
}
