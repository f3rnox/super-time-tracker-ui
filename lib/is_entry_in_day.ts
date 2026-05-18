import { endOfDay, startOfDay } from "date-fns";

import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns whether an entry overlaps any time on the given calendar day.
 */
export function is_entry_in_day(date: Date, entry: TimeSheetEntry): boolean {
  const { end, start } = entry;
  const start_of_day = startOfDay(date);
  const end_of_day = endOfDay(date);
  const effective_end = end ?? new Date();

  return +start <= +end_of_day && +effective_end >= +start_of_day;
}
