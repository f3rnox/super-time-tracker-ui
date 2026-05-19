import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

import { get_sheets_duration_in_range } from "@/lib/get_sheets_duration_in_range";
import { type PeriodTrendComparison } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

export type TrendPeriod = "week" | "month";

/**
 * Compares the current calendar week or month against the prior period.
 */
export function get_period_trend_comparison(
  sheets: TimeSheet[],
  period: TrendPeriod,
  reference: Date = new Date(),
  now: number = Date.now(),
  week_starts_on: 0 | 1 = 1,
): PeriodTrendComparison {
  const current_range = get_period_range(period, reference, week_starts_on);
  const previous_reference =
    period === "week" ? subWeeks(reference, 1) : subMonths(reference, 1);
  const previous_range = get_period_range(
    period,
    previous_reference,
    week_starts_on,
  );

  const current_ms = get_sheets_duration_in_range(
    sheets,
    current_range.start,
    current_range.end,
    now,
  );
  const previous_ms = get_sheets_duration_in_range(
    sheets,
    previous_range.start,
    previous_range.end,
    now,
  );
  const delta_ms = current_ms - previous_ms;
  const delta_ratio = previous_ms > 0 ? delta_ms / previous_ms : 0;

  return {
    label:
      period === "week" ? "This week vs last week" : "This month vs last month",
    currentMs: current_ms,
    previousMs: previous_ms,
    deltaMs: delta_ms,
    deltaRatio: delta_ratio,
  };
}

/**
 * Returns the inclusive millisecond bounds for the requested calendar period.
 */
function get_period_range(
  period: TrendPeriod,
  reference: Date,
  week_starts_on: 0 | 1,
): { start: number; end: number } {
  if (period === "week") {
    return {
      start: +startOfWeek(reference, { weekStartsOn: week_starts_on }),
      end: +endOfWeek(reference, { weekStartsOn: week_starts_on }),
    };
  }

  return {
    start: +startOfMonth(reference),
    end: +endOfMonth(reference),
  };
}
