import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { delete_entry } from "@/lib/delete_entry";
import { edit_entry } from "@/lib/edit_entry";
import { set_entry_archived } from "@/lib/set_entry_archived";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface EntryIdBody {
  sheetName?: string;
  entryId?: number;
}

interface EditEntryBody extends EntryIdBody {
  start?: string;
  end?: string;
  description?: string;
  archived?: boolean;
}

/**
 * Deletes a time sheet entry by id.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as EntryIdBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    await delete_entry({ sheet_name, entry_id });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}

/**
 * Updates a time sheet entry's times or description.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as EditEntryBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    if (body.archived !== undefined) {
      await set_entry_archived({
        sheet_name,
        entry_id,
        archived: body.archived,
      });
    }

    const has_entry_edit =
      body.start !== undefined ||
      body.end !== undefined ||
      body.description !== undefined;

    if (has_entry_edit) {
      await edit_entry({
        sheet_name,
        entry_id,
        start: body.start,
        end: body.end,
        description: body.description,
      });
    } else if (body.archived === undefined) {
      return api_error_response(new Error("No changes provided"));
    }

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
