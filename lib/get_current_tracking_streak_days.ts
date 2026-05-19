import { endOfDay, startOfDay, subDays } from "date-fns";

import { get_sheets_duration_in_range } from "@/lib/get_sheets_duration_in_range";
import { type TimeSheet } from "@/lib/types";

const MAX_STREAK_LOOKBACK_DAYS = 3660;

/**
 * Returns consecutive calendar days with tracked time ending at the reference day.
 * When the reference day has no time yet, counting starts from the previous day.
 */
export function get_current_tracking_streak_days(
  sheets: TimeSheet[],
  reference: Date = new Date(),
  now: number = Date.now(),
): number {
  let cursor = startOfDay(reference);
  const reference_day_ms = get_sheets_duration_in_range(
    sheets,
    +cursor,
    +endOfDay(cursor),
    now,
  );

  if (reference_day_ms <= 0) {
    cursor = subDays(cursor, 1);
  }

  let streak = 0;

  for (
    let days_checked = 0;
    days_checked < MAX_STREAK_LOOKBACK_DAYS;
    days_checked += 1
  ) {
    const day_start_ms = +startOfDay(cursor);
    const day_end_ms = +endOfDay(cursor);
    const day_total_ms = get_sheets_duration_in_range(
      sheets,
      day_start_ms,
      day_end_ms,
      now,
    );

    if (day_total_ms <= 0) {
      break;
    }

    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}
