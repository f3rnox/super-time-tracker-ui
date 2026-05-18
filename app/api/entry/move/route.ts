import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { move_entry_to_sheet } from "@/lib/move_entry_to_sheet";

interface MoveEntryBody {
  sheetName?: string;
  entryId?: number;
  targetSheetName?: string;
}

/**
 * Moves a time sheet entry to another sheet.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as MoveEntryBody;
    const sheet_name = body.sheetName?.trim() ?? "";
    const entry_id = body.entryId;
    const target_sheet_name = body.targetSheetName?.trim() ?? "";

    if (sheet_name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error("Entry id is required"));
    }

    if (target_sheet_name.length === 0) {
      return api_error_response(new Error("Target sheet name is required"));
    }

    await move_entry_to_sheet({
      sheet_name,
      entry_id,
      target_sheet_name,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
