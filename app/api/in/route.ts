import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { check_in_entry } from "@/lib/check_in_entry";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface CheckInBody {
  description?: string;
  sheetName?: string;
  note?: string;
  at?: string;
}

/**
 * Checks in to a time sheet entry.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CheckInBody;
    const description = body.description?.trim() ?? "";

    if (description.length === 0) {
      return api_error_response(new Error("Description is required"));
    }

    await check_in_entry({
      description,
      sheet_name: body.sheetName,
      note: body.note,
      at: body.at,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
