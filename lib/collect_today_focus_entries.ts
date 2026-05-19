import { get_clipped_entry_duration_ms } from '@/lib/get_clipped_entry_duration_ms'
import { get_period_range_ms } from '@/lib/get_period_range_ms'
import { is_entry_in_day } from '@/lib/is_entry_in_day'
import { serialize_entry } from '@/lib/serialize_entry'
import { type TodayFocusEntry } from '@/lib/types/today_focus'
import { type TimeSheet } from '@/lib/types'

/**
 * Collects entries overlapping today with per-entry clipped durations.
 */
export function collect_today_focus_entries(
  sheets: TimeSheet[],
  now: number = Date.now(),
): TodayFocusEntry[] {
  const reference = new Date(now)
  const { endMs, startMs } = get_period_range_ms('today', reference)
  const results: TodayFocusEntry[] = []

  for (const sheet of sheets) {
    for (const entry of sheet.entries) {
      if (!is_entry_in_day(reference, entry)) {
        continue
      }

      const today_duration_ms = get_clipped_entry_duration_ms(
        entry,
        startMs,
        endMs,
        now,
      )

      if (today_duration_ms <= 0) {
        continue
      }

      results.push({
        ...serialize_entry(
          entry,
          sheet.name,
          sheet.activeEntryID === entry.id && entry.end === null,
        ),
        todayDurationMs: today_duration_ms,
      })
    }
  }

  return results.sort((left, right) => +new Date(right.start) - +new Date(left.start))
}
