import { find_sheet_with_active_entry } from "@/lib/find_sheet_with_active_entry";
import { get_sheet } from "@/lib/get_sheet";
import { parse_natural_language_date } from "@/lib/parse_natural_language_date";
import { resolve_default_note_timestamp } from "@/lib/resolve_default_note_timestamp";
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
  const has_target =
    input_sheet_name !== undefined &&
    input_sheet_name.length > 0 &&
    input_entry_id !== undefined &&
    Number.isFinite(input_entry_id);

  const resolved_sheet = has_target
    ? get_sheet(db, input_sheet_name)
    : find_sheet_with_active_entry(db);

  if (resolved_sheet === null) {
    throw new Error("No active sheet");
  }
  const { entries, name: sheet_name } = resolved_sheet;
  const entry_id = has_target ? input_entry_id! : resolved_sheet.activeEntryID;

  if (entry_id === null) {
    throw new Error(`Sheet ${sheet_name} has no active entry`);
  }

  const entry = entries.find(({ id }) => id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  const note_timestamp =
    at === undefined || at.trim().length === 0
      ? resolve_default_note_timestamp(entry)
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
