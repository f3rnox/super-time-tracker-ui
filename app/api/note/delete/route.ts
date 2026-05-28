import { NextResponse } from "next/server";

import { delete_note_on_entry } from "@/lib/delete_note_on_entry";
import { api_error_response } from "@/lib/api_error_response";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface DeleteNoteBody {
  sheetName?: string;
  entryId?: number;
  timestamp?: string;
  noteText?: string;
  text?: string;
}

/**
 * Removes a note from an entry (POST so the JSON body is always received).
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as DeleteNoteBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;
    const timestamp = body.timestamp?.trim() ?? "";
    const note_text = body.noteText?.trim() ?? body.text?.trim();

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    if (timestamp.length === 0) {
      return api_error_response(new Error("Note timestamp is required"));
    }

    await delete_note_on_entry({
      sheet_name,
      entry_id,
      note_timestamp: timestamp,
      text: note_text,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
