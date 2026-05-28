import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { split_entry } from "@/lib/split_entry";

interface SplitEntryBody {
  sheetName?: string;
  entryId?: number;
  at?: string;
}

/**
 * Splits a completed entry into two at a timestamp.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SplitEntryBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;
    const at = body.at?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    if (at.length === 0) {
      return api_error_response(new Error("Split time is required"));
    }

    await split_entry({ sheet_name, entry_id, at });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
