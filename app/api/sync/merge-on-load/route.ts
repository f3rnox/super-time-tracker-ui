import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { type UiPreferencesRecord } from "@/lib/collect_ui_preferences_from_window";
import { get_authenticated_user_id } from "@/lib/get_authenticated_user_id";
import { sync_tracker_db_on_load } from "@/lib/sync_tracker_db_on_load";
import { sync_ui_preferences_on_load } from "@/lib/sync_ui_preferences_on_load";

interface MergeOnLoadBody {
  preferences?: UiPreferencesRecord;
}

/**
 * Merges local tracker data and UI preferences with cloud data on page load.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json().catch(() => ({}))) as MergeOnLoadBody;
    const local_preferences = body.preferences ?? {};
    const user_id = await get_authenticated_user_id();
    const [tracker_result, preferences_result] = await Promise.all([
      sync_tracker_db_on_load(user_id),
      sync_ui_preferences_on_load(local_preferences, user_id),
    ]);

    return NextResponse.json({
      ok: true,
      synced: tracker_result.synced,
      preferences_synced: preferences_result.synced,
      preferences: preferences_result.merged,
    });
  } catch (error: unknown) {
    return api_error_response(error, 500);
  }
}
