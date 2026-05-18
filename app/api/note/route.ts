import { NextResponse } from "next/server";

import { add_note_to_entry } from "@/lib/add_note_to_entry";
import { api_error_response } from "@/lib/api_error_response";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface NoteBody {
  text?: string;
  sheetName?: string;
  entryId?: number;
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
      sheet_name: body.sheetName,
      entry_id: body.entryId,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
