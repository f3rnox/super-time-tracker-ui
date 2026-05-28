import { collect_known_tags } from "@/lib/collect_known_tags";
import { collect_today_focus_entries } from "@/lib/collect_today_focus_entries";
import { filter_visible_sheets } from "@/lib/filter_visible_sheets";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { find_all_serialized_active_entries } from "@/lib/find_all_serialized_active_entries";
import { get_focus_nudges_status } from "@/lib/get_focus_nudges_status";
import { get_start_day_suggestions } from "@/lib/get_start_day_suggestions";
import { read_db } from "@/lib/read_db";
import { type TodayFocusPageData } from "@/lib/types/today_focus";

/**
 * Loads today / focus view data from the tracker database.
 */
export async function get_today_focus_page_data(): Promise<TodayFocusPageData> {
  const db = await read_db();
  const focus_status = await get_focus_nudges_status();
  const today_entries = collect_today_focus_entries(db.sheets);
  const today_total_ms = today_entries.reduce(
    (total, entry) => total + entry.todayDurationMs,
    0,
  );

  return {
    runningEntries: find_all_serialized_active_entries(db),
    todayEntries: today_entries,
    todayTotalMs: today_total_ms,
    focusStatus: focus_status,
    startDaySuggestions: get_start_day_suggestions(db.sheets),
    sheetNames: filter_visible_sheets(db.sheets).map((sheet) => sheet.name),
    sheets: db.sheets.map((sheet) => ({
      name: sheet.name,
      activeEntryID: sheet.activeEntryID,
      entryCount: sheet.entries.length,
      isActive: sheet.name === db.activeSheetName,
      hasActiveEntry: sheet.activeEntryID !== null,
      ...(is_sheet_archived(sheet) ? { archived: true } : {}),
    })),
    knownTags: collect_known_tags(db),
  };
}
