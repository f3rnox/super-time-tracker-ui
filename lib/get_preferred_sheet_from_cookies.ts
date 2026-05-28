import { cookies } from "next/headers";

import { get_initial_preferred_sheet_name } from "@/lib/get_initial_preferred_sheet_name";
import { read_db } from "@/lib/read_db";
import { type TimeTrackerDB } from "@/lib/types";
import {
  ACTIVE_SHEET_COOKIE_NAME,
  DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME,
  DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME,
} from "@/lib/types/ui_settings";

/**
 * Resolves the user's preferred sheet from cookies and the database.
 */
export async function get_preferred_sheet_from_cookies(
  db?: TimeTrackerDB,
): Promise<string | null> {
  const cookie_store = await cookies();
  const resolved_db = db ?? (await read_db());

  return get_initial_preferred_sheet_name(resolved_db, {
    session_mode: cookie_store.get(DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME)
      ?.value,
    fixed_sheet_name: cookie_store.get(DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME)
      ?.value,
    last_viewed_sheet: cookie_store.get(ACTIVE_SHEET_COOKIE_NAME)?.value,
  });
}
