import {
  collect_pending_entry_moves,
  type MoveEntryRef,
} from "@/lib/collect_pending_entry_moves";
import { append_pending_moves_to_target_sheet } from "@/lib/append_pending_moves_to_target_sheet";
import { get_or_create_target_sheet_for_moves } from "@/lib/get_or_create_target_sheet_for_moves";
import { remove_pending_moves_from_source_sheets } from "@/lib/remove_pending_moves_from_source_sheets";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export type { MoveEntryRef } from "@/lib/collect_pending_entry_moves";

export interface MoveEntriesToSheetArgs {
  entries: MoveEntryRef[];
  target_sheet_name: string;
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
  const pending_moves = collect_pending_entry_moves(
    db,
    entry_refs,
    trimmed_target,
  );

  if (pending_moves.length === 0) {
    throw new Error("All selected entries are already on that sheet");
  }

  const active_moves = pending_moves.filter(({ is_active }) => is_active);

  if (active_moves.length > 1) {
    throw new Error("Cannot move multiple active entries at once");
  }

  const target_sheet = get_or_create_target_sheet_for_moves(
    db,
    trimmed_target,
    active_moves,
  );

  remove_pending_moves_from_source_sheets(db, pending_moves);
  append_pending_moves_to_target_sheet({
    db,
    target_sheet,
    trimmed_target,
    pending_moves,
  });

  await write_db(db);
}
