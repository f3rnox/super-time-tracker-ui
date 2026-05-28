import { NextResponse } from "next/server";

import { add_note_to_entry } from "@/lib/add_note_to_entry";
import { delete_note_on_entry } from "@/lib/delete_note_on_entry";
import { edit_note_on_entry } from "@/lib/edit_note_on_entry";
import { api_error_response } from "@/lib/api_error_response";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface NoteBody {
  text?: string;
  at?: string;
  sheetName?: string;
  entryId?: number;
}

interface EditNoteBody extends NoteBody {
  timestamp?: string;
  originalText?: string;
}

/**
 * Attaches a note to an entry.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as NoteBody;
    const text = body.text?.trim() ?? "";

    if (text.length === 0) {
      return api_error_response(new Error("Note text is required"));
    }

    await add_note_to_entry({
      text,
      at: body.at,
      sheet_name: body.sheetName,
      entry_id: body.entryId,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}

/**
 * Updates an existing note on an entry.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as EditNoteBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;
    const timestamp = body.timestamp?.trim() ?? "";
    const text = body.text?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    if (timestamp.length === 0) {
      return api_error_response(new Error("Note timestamp is required"));
    }

    if (text.length === 0) {
      return api_error_response(new Error("Note text is required"));
    }

    await edit_note_on_entry({
      sheet_name,
      entry_id,
      note_timestamp: timestamp,
      text,
      original_text: body.originalText,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}

/**
 * Removes a note from an entry.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as EditNoteBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;
    const timestamp = body.timestamp?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    if (timestamp.length === 0) {
      return api_error_response(new Error("Note timestamp is required"));
    }

    const note_text = body.text?.trim();

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
