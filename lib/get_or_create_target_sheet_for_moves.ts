import { gen_sheet } from "@/lib/gen_db";
import { get_sheet } from "@/lib/get_sheet";
import { type PendingEntryMove } from "@/lib/collect_pending_entry_moves";
import { type TimeSheet, type TimeTrackerDB } from "@/lib/types";

/**
 * Resolves the target sheet for a bulk move, creating it when missing.
 */
export function get_or_create_target_sheet_for_moves(
  db: TimeTrackerDB,
  trimmed_target: string,
  active_moves: PendingEntryMove[],
): TimeSheet {
  const target_exists = db.sheets.some(({ name }) => name === trimmed_target);
  const target_sheet = target_exists
    ? get_sheet(db, trimmed_target)
    : (() => {
        const created = gen_sheet(trimmed_target);
        db.sheets.push(created);
        return created;
      })();

  if (active_moves.length === 1 && target_sheet.activeEntryID !== null) {
    const active_entry = target_sheet.entries.find(
      ({ id }) => id === target_sheet.activeEntryID,
    );

    if (active_entry !== undefined) {
      throw new Error(
        `Sheet ${trimmed_target} already has an active entry (${active_entry.description})`,
      );
    }
  }

  return target_sheet;
}
