import { type TodayFocusEntry } from "@/lib/types/today_focus";

/**
 * Keeps today entries whose sheet name is in the allowed set.
 */
export function filter_today_focus_by_sheet_names(
  entries: TodayFocusEntry[],
  sheet_names: Set<string>,
): TodayFocusEntry[] {
  return entries.filter((entry) => sheet_names.has(entry.sheetName));
}
