import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { pick_merged_active_sheet_when_both_valid } from "@/lib/pick_merged_active_sheet_when_both_valid";
import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";
import { type TimeSheet } from "@/lib/types";

/**
 * Picks which sheet should be active after merging two databases.
 */
export function pick_merged_active_sheet_name(
  base_active_sheet: string | null,
  incoming_active_sheet: string | null,
  sheets: TimeSheet[],
  prefer: MergePreference,
): string | null {
  const sheet_names = new Set(sheets.map((sheet) => sheet.name));

  const base_valid =
    base_active_sheet !== null && sheet_names.has(base_active_sheet);
  const incoming_valid =
    incoming_active_sheet !== null && sheet_names.has(incoming_active_sheet);

  if (base_valid && incoming_valid) {
    return pick_merged_active_sheet_when_both_valid({
      base_active_sheet,
      incoming_active_sheet,
      sheets,
      prefer,
    });
  }

  if (incoming_valid) {
    return incoming_active_sheet;
  }

  if (base_valid) {
    return base_active_sheet;
  }

  const running_sheet = sheets.find(
    (sheet) => find_running_entry_on_sheet(sheet) !== null,
  );

  return running_sheet?.name ?? sheets[0]?.name ?? null;
}
