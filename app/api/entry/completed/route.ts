import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { create_completed_entry } from "@/lib/create_completed_entry";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface CreateCompletedEntryBody {
  sheetName?: string;
  description?: string;
  start?: string;
  end?: string;
  note?: string;
}

/**
 * Creates a completed historical entry, used by end-of-day gap review.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateCompletedEntryBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const start = body.start?.trim() ?? "";
    const end = body.end?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (description.length === 0) {
      return api_error_response(new Error("Description is required"));
    }

    if (start.length === 0 || end.length === 0) {
      return api_error_response(new Error("Start and end are required"));
    }

    await create_completed_entry({
      sheet_name,
      description,
      start,
      end,
      note: body.note,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
