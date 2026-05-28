import { get_next_entry_id } from "@/lib/get_next_entry_id";
import { type PendingEntryMove } from "@/lib/collect_pending_entry_moves";
import { type TimeSheet, type TimeTrackerDB } from "@/lib/types";

export interface AppendPendingMovesToTargetSheetArgs {
  db: TimeTrackerDB;
  target_sheet: TimeSheet;
  trimmed_target: string;
  pending_moves: PendingEntryMove[];
}

/**
 * Appends pending moves to the target sheet and updates active sheet state.
 */
export function append_pending_moves_to_target_sheet(
  args: AppendPendingMovesToTargetSheetArgs,
): void {
  const { db, target_sheet, trimmed_target, pending_moves } = args;

  for (const move of pending_moves) {
    const new_id = get_next_entry_id(target_sheet);

    target_sheet.entries.push({
      ...move.entry,
      id: new_id,
    });

    if (move.is_active) {
      target_sheet.activeEntryID = new_id;
      db.activeSheetName = trimmed_target;
    }
  }
}
