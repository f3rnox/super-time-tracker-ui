import { type TimeSheet } from '@/lib/types'

/**
 * Returns the latest activity timestamp for a sheet, or null when empty.
 */
export function get_sheet_last_activity_ms(
  sheet: TimeSheet,
  now: number = Date.now(),
): number | null {
  let latest_ms: number | null = null

  for (const entry of sheet.entries) {
    const end_ms = entry.end === null ? now : +entry.end
    const activity_ms = Math.max(+entry.start, end_ms)

    if (latest_ms === null || activity_ms > latest_ms) {
      latest_ms = activity_ms
    }
  }

  return latest_ms
}
