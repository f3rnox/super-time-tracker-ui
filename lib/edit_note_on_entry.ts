import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface EditNoteOnEntryArgs {
  text: string;
  note_timestamp: string;
  sheet_name: string;
  entry_id: number;
}

/**
 * Updates the text of an existing note on a time sheet entry.
 */
export async function edit_note_on_entry(
  args: EditNoteOnEntryArgs,
): Promise<void> {
  const { entry_id, note_timestamp, sheet_name, text } = args;
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw new Error("Note text is required");
  }

  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry = sheet.entries.find(({ id }) => id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  const target_ms = new Date(note_timestamp).getTime();

  if (Number.isNaN(target_ms)) {
    throw new Error("Invalid note timestamp");
  }

  const note = entry.notes.find(
    ({ timestamp }) => timestamp.getTime() === target_ms,
  );

  if (note === undefined) {
    throw new Error("Note not found on entry");
  }

  note.text = trimmed;
  await write_db(db);
}
