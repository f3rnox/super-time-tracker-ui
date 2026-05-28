import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheet } from "@/lib/types";

export interface PickMergedActiveSheetWhenBothValidArgs {
  base_active_sheet: string;
  incoming_active_sheet: string;
  sheets: TimeSheet[];
  prefer: MergePreference;
}

/**
 * Picks the active sheet when both base and incoming names are valid.
 */
export function pick_merged_active_sheet_when_both_valid(
  args: PickMergedActiveSheetWhenBothValidArgs,
): string {
  const { base_active_sheet, incoming_active_sheet, sheets, prefer } = args;
  const base_running = sheets.find((sheet) => sheet.name === base_active_sheet);
  const incoming_running = sheets.find(
    (sheet) => sheet.name === incoming_active_sheet,
  );

  const base_has_running =
    base_running !== undefined &&
    find_running_entry_on_sheet(base_running) !== null;
  const incoming_has_running =
    incoming_running !== undefined &&
    find_running_entry_on_sheet(incoming_running) !== null;

  if (base_has_running && !incoming_has_running) {
    return base_active_sheet;
  }

  if (incoming_has_running && !base_has_running) {
    return incoming_active_sheet;
  }

  return prefer === "incoming" ? incoming_active_sheet : base_active_sheet;
}
