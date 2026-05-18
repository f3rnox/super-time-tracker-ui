import { find_sheet_with_active_entry } from "@/lib/find_sheet_with_active_entry";
import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface AddNoteToEntryArgs {
  text: string;
  sheet_name?: string;
  entry_id?: number;
}

/**
 * Appends a timestamped note to the active or specified entry.
 */
export async function add_note_to_entry(
  args: AddNoteToEntryArgs,
): Promise<void> {
  const { text, entry_id: input_entry_id, sheet_name: input_sheet_name } = args;
  const db = await read_db();
  const sheet =
    input_sheet_name !== undefined && input_sheet_name.length > 0
      ? get_sheet(db, input_sheet_name)
      : find_sheet_with_active_entry(db);

  if (sheet === null) {
    throw new Error("No active sheet");
  }

  const { name: sheet_name } = sheet;
  const entry_id = input_entry_id ?? sheet.activeEntryID;

  if (entry_id === null) {
    throw new Error(`Sheet ${sheet_name} has no active entry`);
  }

  const entry = sheet.entries.find(({ id }) => id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  entry.notes.push({ timestamp: new Date(), text });
  await write_db(db);
}
