import { get_clipped_entry_duration_ms } from '@/lib/get_clipped_entry_duration_ms'
import { type TimeSheet } from '@/lib/types'

/**
 * Sums clipped entry durations across all sheets within a time range.
 */
export function get_sheets_duration_in_range(
  sheets: TimeSheet[],
  range_start_ms: number,
  range_end_ms: number,
  now: number = Date.now(),
): number {
  let total_ms = 0

  for (const sheet of sheets) {
    for (const entry of sheet.entries) {
      total_ms += get_clipped_entry_duration_ms(
        entry,
        range_start_ms,
        range_end_ms,
        now,
      )
    }
  }

  return total_ms
}
