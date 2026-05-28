import type { SupabaseClient } from "@supabase/supabase-js";

import { type TimeSheet } from "@/lib/types";

interface EntryInsertRow {
  sheet_id: string;
  id: number;
  start_at: string;
  end_at: string | null;
  description: string;
  tags: string[];
  archived?: boolean;
}

interface NoteInsertRow {
  sheet_id: string;
  entry_id: number;
  note_index: number;
  noted_at: string;
  text: string;
}

/**
 * Upserts entries and replaces notes for one sheet in Supabase.
 */
export async function sync_supabase_sheet_entries(
  supabase: SupabaseClient,
  sheet_id: string,
  sheet: TimeSheet,
  include_archived: boolean = true,
): Promise<void> {
  const desired_entry_ids = new Set(sheet.entries.map((entry) => entry.id));

  const { data: existing_entry_rows, error: list_entries_error } =
    await supabase.from("entries").select("id").eq("sheet_id", sheet_id);

  if (list_entries_error !== null) {
    throw new Error(
      `Failed to list entries for "${sheet.name}": ${list_entries_error.message}`,
    );
  }

  const existing_entry_ids = (existing_entry_rows ?? []).map(
    (row) => (row as { id: number }).id,
  );
  const entry_ids_to_delete = existing_entry_ids.filter(
    (id) => !desired_entry_ids.has(id),
  );

  if (entry_ids_to_delete.length > 0) {
    const { error: delete_entries_error } = await supabase
      .from("entries")
      .delete()
      .eq("sheet_id", sheet_id)
      .in("id", entry_ids_to_delete);

    if (delete_entries_error !== null) {
      throw new Error(
        `Failed to remove entries for "${sheet.name}": ${delete_entries_error.message}`,
      );
    }
  }

  const { error: clear_notes_error } = await supabase
    .from("entry_notes")
    .delete()
    .eq("sheet_id", sheet_id);

  if (clear_notes_error !== null) {
    throw new Error(
      `Failed to clear notes for "${sheet.name}": ${clear_notes_error.message}`,
    );
  }

  if (sheet.entries.length === 0) {
    return;
  }

  const entry_rows: EntryInsertRow[] = sheet.entries.map((entry) => ({
    sheet_id,
    id: entry.id,
    start_at: entry.start.toISOString(),
    end_at: entry.end === null ? null : entry.end.toISOString(),
    description: entry.description,
    tags: entry.tags,
    ...(include_archived && entry.archived === true ? { archived: true } : {}),
  }));

  const { error: entries_error } = await supabase
    .from("entries")
    .upsert(entry_rows, { onConflict: "sheet_id,id" });

  if (entries_error !== null) {
    throw new Error(
      `Failed to save entries for "${sheet.name}": ${entries_error.message}`,
    );
  }

  const note_rows: NoteInsertRow[] = [];

  for (const entry of sheet.entries) {
    entry.notes.forEach((note, note_index) => {
      note_rows.push({
        sheet_id,
        entry_id: entry.id,
        note_index,
        noted_at: note.timestamp.toISOString(),
        text: note.text,
      });
    });
  }

  if (note_rows.length === 0) {
    return;
  }

  const { error: notes_error } = await supabase
    .from("entry_notes")
    .insert(note_rows);

  if (notes_error !== null) {
    throw new Error(
      `Failed to save notes for "${sheet.name}": ${notes_error.message}`,
    );
  }
}
