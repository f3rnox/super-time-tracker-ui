import { get_sheet } from "@/lib/get_sheet";
import { type PendingEntryMove } from "@/lib/collect_pending_entry_moves";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Removes pending moves from their source sheets in the database.
 */
export function remove_pending_moves_from_source_sheets(
  db: TimeTrackerDB,
  pending_moves: PendingEntryMove[],
): void {
  const by_source = new Map<string, PendingEntryMove[]>();

  for (const move of pending_moves) {
    const list = by_source.get(move.source_sheet_name) ?? [];
    list.push(move);
    by_source.set(move.source_sheet_name, list);
  }

  for (const [source_sheet_name, moves] of by_source) {
    const source_sheet = get_sheet(db, source_sheet_name);
    const ids_to_remove = moves
      .map(({ entry }) => entry.id)
      .sort((left, right) => right - left);

    for (const entry_id of ids_to_remove) {
      const entry_index = source_sheet.entries.findIndex(
        ({ id }) => id === entry_id,
      );

      if (entry_index === -1) {
        continue;
      }

      source_sheet.entries.splice(entry_index, 1);

      if (source_sheet.activeEntryID === entry_id) {
        source_sheet.activeEntryID = null;
      }
    }
  }
}
