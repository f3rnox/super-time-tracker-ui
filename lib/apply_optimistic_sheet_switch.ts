import { type TrackerState } from "@/lib/types/tracker_state";

/**
 * Updates tracker UI state immediately when the user selects a different sheet.
 */
export function apply_optimistic_sheet_switch(
  state: TrackerState,
  sheet_name: string,
): TrackerState {
  const active_entry =
    state.runningEntries.find((entry) => entry.sheetName === sheet_name) ??
    null;

  return {
    ...state,
    activeSheetName: sheet_name,
    sheets: state.sheets.map((sheet) => ({
      ...sheet,
      isActive: sheet.name === sheet_name,
    })),
    activeEntry: active_entry,
    activeSheetEntries: state.activeSheetEntries,
    activeSheetTotalMs: state.activeSheetTotalMs,
  };
}
