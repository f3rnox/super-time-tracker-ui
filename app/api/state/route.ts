import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_preferred_sheet_from_cookies } from "@/lib/get_preferred_sheet_from_cookies";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { read_db } from "@/lib/read_db";

/**
 * Returns the current tracker state snapshot.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const db = await read_db();
    const preferred_sheet = await get_preferred_sheet_from_cookies(db);
    const state = await get_tracker_state(preferred_sheet, { db });
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
