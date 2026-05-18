import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { move_entries_to_sheet } from "@/lib/move_entries_to_sheet";

interface MoveEntryRefBody {
  sheetName?: string;
  entryId?: number;
}

interface MoveEntriesBody {
  entries?: MoveEntryRefBody[];
  targetSheetName?: string;
}

/**
 * Moves multiple time sheet entries to another sheet.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as MoveEntriesBody;
    const target_sheet_name = body.targetSheetName?.trim() ?? "";
    const raw_entries = body.entries ?? [];

    if (target_sheet_name.length === 0) {
      return api_error_response(new Error("Target sheet name is required"));
    }

    if (raw_entries.length === 0) {
      return api_error_response(new Error("No entries selected"));
    }

    const entries = raw_entries.map((entry, index) => {
      const sheet_name = entry.sheetName?.trim() ?? "";
      const entry_id = entry.entryId;

      if (sheet_name.length === 0) {
        throw new Error(`Entry ${index + 1} is missing a sheet name`);
      }

      if (entry_id === undefined || !Number.isFinite(entry_id)) {
        throw new Error(`Entry ${index + 1} is missing an entry id`);
      }

      return {
        sheet_name,
        entry_id,
      };
    });

    await move_entries_to_sheet({
      entries,
      target_sheet_name,
    });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
