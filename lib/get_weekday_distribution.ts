import { addDays, format, startOfWeek } from "date-fns";

import {
  type DailyTimeBucket,
  type WeekdayTimeStat,
} from "@/lib/types/reporting";

/**
 * Aggregates daily buckets into per-weekday totals starting on the configured day.
 */
export function get_weekday_distribution(
  daily_buckets: DailyTimeBucket[],
  week_starts_on: 0 | 1 = 1,
): WeekdayTimeStat[] {
  const totals = new Array<number>(7).fill(0);

  for (const bucket of daily_buckets) {
    totals[bucket.weekdayIndex] += bucket.totalMs;
  }

  const reference = startOfWeek(new Date(), { weekStartsOn: week_starts_on });

  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(reference, offset);
    const weekday_index = (week_starts_on + offset) % 7;

    return {
      weekdayIndex: weekday_index,
      weekdayLabel: format(date, "EEE"),
      totalMs: totals[weekday_index],
    };
  });
}
