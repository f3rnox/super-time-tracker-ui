import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_focus_nudges_status } from "@/lib/get_focus_nudges_status";
import { type FocusGoalScope } from "@/lib/types/ui_preferences";

/**
 * Returns focus goal progress and reminder metrics.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const request_url = new URL(request.url);
    const scope_raw = request_url.searchParams.get("scope");
    const scope: FocusGoalScope =
      scope_raw === "sheet" || scope_raw === "tag" ? scope_raw : "global";
    const sheet_name = request_url.searchParams.get("sheet") ?? undefined;
    const tag_name = request_url.searchParams.get("tag") ?? undefined;
    const status = await get_focus_nudges_status({
      scope,
      sheet_name,
      tag_name,
    });

    return NextResponse.json(status);
  } catch (error: unknown) {
    return api_error_response(error, 500);
  }
}
