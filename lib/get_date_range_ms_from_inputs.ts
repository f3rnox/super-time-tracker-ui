import { endOfDay, parse, startOfDay } from "date-fns";

import { type PeriodRangeMs } from "@/lib/get_period_range_ms";

/**
 * Converts date input values into inclusive millisecond bounds, or null when unset.
 */
export function get_date_range_ms_from_inputs(
  from_date: string,
  to_date: string,
): PeriodRangeMs | null {
  if (from_date.length === 0 || to_date.length === 0) {
    return null;
  }

  const range_start = parse(from_date, "yyyy-MM-dd", new Date());
  const range_end = parse(to_date, "yyyy-MM-dd", new Date());

  if (Number.isNaN(+range_start) || Number.isNaN(+range_end)) {
    return null;
  }

  if (+range_start > +range_end) {
    return null;
  }

  return {
    startMs: +startOfDay(range_start),
    endMs: +endOfDay(range_end),
  };
}
