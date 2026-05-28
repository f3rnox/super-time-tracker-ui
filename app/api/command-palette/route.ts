import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_command_palette_snapshot } from "@/lib/get_command_palette_snapshot";

/**
 * Returns sheets, recent entries, and search matches for the command palette.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams.get("q") ?? undefined;
    const snapshot = await get_command_palette_snapshot(query);

    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    return api_error_response(error);
  }
}
