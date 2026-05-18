import { find_sheet_with_active_entry } from "@/lib/find_sheet_with_active_entry";
import { get_sheet } from "@/lib/get_sheet";
import { parse_natural_language_date } from "@/lib/parse_natural_language_date";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface AddNoteToEntryArgs {
  text: string;
  sheet_name?: string;
  entry_id?: number;
  at?: string;
}

/**
 * Appends a timestamped note to the active or specified entry.
 */
export async function add_note_to_entry(
  args: AddNoteToEntryArgs,
): Promise<void> {
  const {
    text,
    at,
    entry_id: input_entry_id,
    sheet_name: input_sheet_name,
  } = args;
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

  const note_timestamp =
    at === undefined || at.trim().length === 0
      ? new Date()
      : parse_natural_language_date(at);
  const latest_allowed = entry.end ?? new Date();

  if (+note_timestamp < +entry.start) {
    throw new Error("Note time must be on or after entry start");
  }

  if (+note_timestamp > +latest_allowed) {
    throw new Error("Note time must be on or before entry end");
  }

  entry.notes.push({ timestamp: note_timestamp, text });
  await write_db(db);
}
