import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { delete_sheet } from "@/lib/delete_sheet";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { rename_sheet } from "@/lib/rename_sheet";
import { set_active_sheet } from "@/lib/set_active_sheet";

interface SheetBody {
  name?: string;
  delete?: boolean;
}

interface RenameSheetBody {
  name?: string;
  newName?: string;
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

    const state = await get_tracker_state(body.delete === true ? undefined : name);
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}

/**
 * Renames an existing sheet.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RenameSheetBody;
    const name = body.name?.trim() ?? "";
    const new_name = body.newName?.trim() ?? "";

    if (name.length === 0) {
      return api_error_response(new Error("Sheet name is required"));
    }

    if (new_name.length === 0) {
      return api_error_response(new Error("New sheet name is required"));
    }

    await rename_sheet({ sheet_name: name, new_name });

    const state = await get_tracker_state();
    return NextResponse.json(state);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
