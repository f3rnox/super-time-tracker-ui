import { find_entry_note_index } from "@/lib/find_entry_note_index";
import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface DeleteNoteOnEntryArgs {
  note_timestamp: string;
  sheet_name: string;
  entry_id: number;
  text?: string;
}

/**
 * Removes a note from a time sheet entry by timestamp.
 */
export async function delete_note_on_entry(
  args: DeleteNoteOnEntryArgs,
): Promise<void> {
  const { entry_id, note_timestamp, sheet_name, text } = args;
  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry = sheet.entries.find(({ id }) => id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  const note_index = find_entry_note_index({
    notes: entry.notes,
    note_timestamp,
    text,
  });

  if (note_index === -1) {
    const trimmed = text?.trim() ?? "";

    throw new Error(
      trimmed.length === 0
        ? "Note not found on entry (duplicate timestamps require noteText)"
        : "Note not found on entry",
    );
  }

  entry.notes.splice(note_index, 1);
  await write_db(db);
}
