import { gen_sheet } from "@/lib/gen_db";
import { get_next_entry_id } from "@/lib/get_next_entry_id";
import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface MoveEntryToSheetArgs {
  sheet_name: string;
  entry_id: number;
  target_sheet_name: string;
}

/**
 * Moves an entry from one sheet to another, preserving active status when applicable.
 */
export async function move_entry_to_sheet(
  args: MoveEntryToSheetArgs,
): Promise<void> {
  const { entry_id, sheet_name, target_sheet_name } = args;
  const trimmed_target = target_sheet_name.trim();

  if (trimmed_target.length === 0) {
    throw new Error("Target sheet name is required");
  }

  if (sheet_name === trimmed_target) {
    throw new Error("Entry is already on that sheet");
  }

  const db = await read_db();
  const source_sheet = get_sheet(db, sheet_name);
  const entry_index = source_sheet.entries.findIndex(
    ({ id }) => id === entry_id,
  );

  if (entry_index === -1) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  const entry = source_sheet.entries[entry_index];
  const is_active = source_sheet.activeEntryID === entry_id;

  const target_exists = db.sheets.some(({ name }) => name === trimmed_target);
  const target_sheet = target_exists
    ? get_sheet(db, trimmed_target)
    : (() => {
        const created = gen_sheet(trimmed_target);
        db.sheets.push(created);
        return created;
      })();

  if (target_sheet.activeEntryID !== null) {
    const active_entry = target_sheet.entries.find(
      ({ id }) => id === target_sheet.activeEntryID,
    );

    if (active_entry !== undefined) {
      throw new Error(
        `Sheet ${trimmed_target} already has an active entry (${active_entry.description})`,
      );
    }
  }

  source_sheet.entries.splice(entry_index, 1);

  if (is_active) {
    source_sheet.activeEntryID = null;
  }

  const new_id = get_next_entry_id(target_sheet);
  const moved_entry: TimeSheetEntry = {
    ...entry,
    id: new_id,
  };

  target_sheet.entries.push(moved_entry);

  if (is_active) {
    target_sheet.activeEntryID = new_id;
    db.activeSheetName = trimmed_target;
  }

  await write_db(db);
}
