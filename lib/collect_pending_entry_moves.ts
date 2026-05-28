import { get_sheet } from "@/lib/get_sheet";
import { type TimeSheetEntry, type TimeTrackerDB } from "@/lib/types";

export interface MoveEntryRef {
  sheet_name: string;
  entry_id: number;
}

export interface PendingEntryMove {
  source_sheet_name: string;
  entry: TimeSheetEntry;
  is_active: boolean;
}

/**
 * Resolves entry refs into deduplicated pending moves for a target sheet.
 */
export function collect_pending_entry_moves(
  db: TimeTrackerDB,
  entry_refs: MoveEntryRef[],
  trimmed_target: string,
): PendingEntryMove[] {
  const pending_moves: PendingEntryMove[] = [];
  const seen = new Set<string>();

  for (const { entry_id, sheet_name } of entry_refs) {
    const key = `${sheet_name}:${entry_id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    if (sheet_name === trimmed_target) {
      continue;
    }

    const source_sheet = get_sheet(db, sheet_name);
    const entry = source_sheet.entries.find(({ id }) => id === entry_id);

    if (entry === undefined) {
      throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
    }

    pending_moves.push({
      source_sheet_name: sheet_name,
      entry: {
        ...entry,
        notes: [...entry.notes],
        tags: [...entry.tags],
      },
      is_active: source_sheet.activeEntryID === entry_id,
    });
  }

  return pending_moves;
}
