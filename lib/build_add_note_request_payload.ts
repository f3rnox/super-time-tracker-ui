export interface AddNoteRequestPayload {
  text: string;
  sheetName: string;
  entryId?: number;
  at?: string;
}

/**
 * Builds the JSON body for POST /api/note.
 */
export function build_add_note_request_payload(
  text: string,
  sheet_name: string,
  entry_id: number | undefined,
  at: string | undefined,
): AddNoteRequestPayload {
  if (at === undefined) {
    return { text, sheetName: sheet_name, entryId: entry_id };
  }

  return { text, sheetName: sheet_name, entryId: entry_id, at };
}
