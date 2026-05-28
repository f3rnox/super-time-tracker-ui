import { find_entry_note_index } from "@/lib/find_entry_note_index";
import { find_sheet_entry_by_id } from "@/lib/find_sheet_entry_by_id";
import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface EditNoteOnEntryArgs {
  text: string;
  note_timestamp: string;
  sheet_name: string;
  entry_id: number;
  original_text?: string;
}

/**
 * Updates the text of an existing note on a time sheet entry.
 */
export async function edit_note_on_entry(
  args: EditNoteOnEntryArgs,
): Promise<void> {
  const { entry_id, note_timestamp, sheet_name, text, original_text } = args;
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw new Error("Note text is required");
  }

  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry = find_sheet_entry_by_id(sheet, entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  const note_index = find_entry_note_index({
    notes: entry.notes,
    note_timestamp,
    text: original_text,
  });

  if (note_index === -1) {
    throw new Error(
      original_text === undefined
        ? "Note not found on entry (duplicate timestamps require originalText)"
        : "Note not found on entry",
    );
  }

  entry.notes[note_index].text = trimmed;
  await write_db(db);
}
