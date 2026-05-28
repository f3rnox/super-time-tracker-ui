import { endOfDay, startOfDay, subDays } from "date-fns";

import { type TodayStartDaySuggestion } from "@/lib/types/today_focus";
import { type TimeSheet } from "@/lib/types";

/**
 * Suggests first tasks per sheet using yesterday's latest entry.
 */
export function get_start_day_suggestions(
  sheets: TimeSheet[],
  now: Date = new Date(),
): TodayStartDaySuggestion[] {
  const yesterday = subDays(now, 1);
  const yesterday_start_ms = +startOfDay(yesterday);
  const yesterday_end_ms = +endOfDay(yesterday);
  const suggestions: TodayStartDaySuggestion[] = [];

  for (const sheet of sheets) {
    let latest_entry: (typeof sheet.entries)[number] | null = null;
    let latest_ms = Number.NEGATIVE_INFINITY;

    for (const entry of sheet.entries) {
      const entry_end_ms = entry.end === null ? +entry.start : +entry.end;

      if (
        entry_end_ms < yesterday_start_ms ||
        entry_end_ms > yesterday_end_ms
      ) {
        continue;
      }

      if (entry_end_ms > latest_ms) {
        latest_entry = entry;
        latest_ms = entry_end_ms;
      }
    }

    if (latest_entry === null) {
      continue;
    }

    suggestions.push({
      sheetName: sheet.name,
      suggestedDescription: latest_entry.description,
      suggestedTags: latest_entry.tags,
      lastLoggedAt: new Date(latest_ms).toISOString(),
    });
  }

  return suggestions.sort(
    (left, right) =>
      +new Date(right.lastLoggedAt) - +new Date(left.lastLoggedAt),
  );
}
