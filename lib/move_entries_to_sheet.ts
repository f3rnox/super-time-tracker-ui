import { gen_sheet } from "@/lib/gen_db";
import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface MoveEntryRef {
  sheet_name: string;
  entry_id: number;
}

export interface MoveEntriesToSheetArgs {
  entries: MoveEntryRef[];
  target_sheet_name: string;
}

interface PendingMove {
  source_sheet_name: string;
  entry: TimeSheetEntry;
  is_active: boolean;
}

/**
 * Moves multiple entries to another sheet in a single database write.
 */
export async function move_entries_to_sheet(
  args: MoveEntriesToSheetArgs,
): Promise<void> {
  const { entries: entry_refs, target_sheet_name } = args;
  const trimmed_target = target_sheet_name.trim();

  if (entry_refs.length === 0) {
    throw new Error("No entries selected");
  }

  if (trimmed_target.length === 0) {
    throw new Error("Target sheet name is required");
  }

  const db = await read_db();
  const pending_moves: PendingMove[] = [];
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

  if (pending_moves.length === 0) {
    throw new Error("All selected entries are already on that sheet");
  }

  const active_moves = pending_moves.filter(({ is_active }) => is_active);

  if (active_moves.length > 1) {
    throw new Error("Cannot move multiple active entries at once");
  }

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

  const by_source = new Map<string, PendingMove[]>();

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

  for (const move of pending_moves) {
    const new_id = target_sheet.entries.length;

    target_sheet.entries.push({
      ...move.entry,
      id: new_id,
    });

    if (move.is_active) {
      target_sheet.activeEntryID = new_id;
      db.activeSheetName = trimmed_target;
    }
  }

  await write_db(db);
}
