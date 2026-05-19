import { addDays, endOfDay, format, getDay, startOfDay } from "date-fns";

import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { type DailyTimeBucket } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

/**
 * Builds per-day totals between two inclusive day boundaries.
 */
export function get_daily_time_buckets(
  sheets: TimeSheet[],
  range_start_ms: number,
  range_end_ms: number,
  now: number = Date.now(),
): DailyTimeBucket[] {
  const buckets: DailyTimeBucket[] = [];
  const start = startOfDay(new Date(range_start_ms));
  const end = startOfDay(new Date(range_end_ms));

  if (+start > +end) {
    return buckets;
  }

  let cursor = start;

  while (+cursor <= +end) {
    const day_start_ms = +startOfDay(cursor);
    const day_end_ms = +endOfDay(cursor);

    let day_total_ms = 0;

    for (const sheet of sheets) {
      for (const entry of sheet.entries) {
        day_total_ms += get_clipped_entry_duration_ms(
          entry,
          day_start_ms,
          day_end_ms,
          now,
        );
      }
    }

    buckets.push({
      dateMs: day_start_ms,
      dateLabel: format(cursor, "MMM d"),
      weekdayIndex: getDay(cursor),
      totalMs: day_total_ms,
    });

    cursor = addDays(cursor, 1);
  }

  return buckets;
}
