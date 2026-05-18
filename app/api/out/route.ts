import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { check_out_entry } from "@/lib/check_out_entry";
import { get_tracker_state } from "@/lib/get_tracker_state";

interface CheckOutBody {
  sheetName?: string;
  note?: string;
}

/**
 * Checks out of the active time sheet entry.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CheckOutBody;

    await check_out_entry({
      sheet_name: body.sheetName,
      note: body.note,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
