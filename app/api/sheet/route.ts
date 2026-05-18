import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { delete_sheet } from "@/lib/delete_sheet";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { set_active_sheet } from "@/lib/set_active_sheet";

interface SheetBody {
  name?: string;
  delete?: boolean;
}

/**
 * Switches the active sheet or deletes one by name.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SheetBody;
    const name = body.name?.trim() ?? "";

    if (name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (body.delete === true) {
      await delete_sheet(name);
    } else {
      await set_active_sheet(name);
    }

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
