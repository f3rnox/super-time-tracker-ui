import { addDays, endOfDay, getDay, startOfDay } from "date-fns";

import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { type HeatmapCell } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;

/**
 * Builds a weekday × hour-of-day activity heatmap by clipping entries to each hour cell.
 */
export function get_activity_heatmap(
  sheets: TimeSheet[],
  range_start_ms: number,
  range_end_ms: number,
  now: number = Date.now(),
): HeatmapCell[] {
  const totals = new Map<string, number>();
  const start = startOfDay(new Date(range_start_ms));
  const end = startOfDay(new Date(range_end_ms));

  if (+start > +end) {
    return build_empty_heatmap(totals);
  }

  let cursor = start;

  while (+cursor <= +end) {
    const weekday_index = getDay(cursor);
    const day_start_ms = +cursor;
    const day_end_ms = +endOfDay(cursor);
    const hour_size_ms = 60 * 60 * 1000;

    for (let hour = 0; hour < HOURS_IN_DAY; hour += 1) {
      const cell_start_ms = day_start_ms + hour * hour_size_ms;
      const cell_end_ms = Math.min(
        cell_start_ms + hour_size_ms - 1,
        day_end_ms,
      );

      let cell_total_ms = 0;

      for (const sheet of sheets) {
        for (const entry of sheet.entries) {
          cell_total_ms += get_clipped_entry_duration_ms(
            entry,
            cell_start_ms,
            cell_end_ms,
            now,
          );
        }
      }

      if (cell_total_ms <= 0) {
        continue;
      }

      const key = `${weekday_index}-${hour}`;
      totals.set(key, (totals.get(key) ?? 0) + cell_total_ms);
    }

    cursor = addDays(cursor, 1);
  }

  return build_empty_heatmap(totals);
}

/**
 * Returns the dense weekday × hour matrix, filling any missing cells with zero.
 */
function build_empty_heatmap(totals: Map<string, number>): HeatmapCell[] {
  const cells: HeatmapCell[] = [];

  for (
    let weekday_index = 0;
    weekday_index < DAYS_IN_WEEK;
    weekday_index += 1
  ) {
    for (let hour_index = 0; hour_index < HOURS_IN_DAY; hour_index += 1) {
      const key = `${weekday_index}-${hour_index}`;
      cells.push({
        weekdayIndex: weekday_index,
        hourIndex: hour_index,
        totalMs: totals.get(key) ?? 0,
      });
    }
  }

  return cells;
}
