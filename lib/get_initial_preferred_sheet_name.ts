import { parse_default_sheet_session_mode } from "@/lib/parse_default_sheet_session_mode";
import { resolve_session_preferred_sheet } from "@/lib/resolve_session_preferred_sheet";
import { type TimeTrackerDB } from "@/lib/types";

export interface InitialPreferredSheetCookies {
  session_mode?: string;
  fixed_sheet_name?: string;
  last_viewed_sheet?: string;
}

/**
 * Chooses the preferred sheet for a new session from cookies and the database.
 */
export function get_initial_preferred_sheet_name(
  db: TimeTrackerDB,
  cookies: InitialPreferredSheetCookies,
): string | null {
  const mode = parse_default_sheet_session_mode(cookies.session_mode);
  const last_viewed_sheet =
    cookies.last_viewed_sheet !== undefined
      ? decodeURIComponent(cookies.last_viewed_sheet).trim() || null
      : null;
  const fixed_sheet_name =
    cookies.fixed_sheet_name !== undefined
      ? decodeURIComponent(cookies.fixed_sheet_name).trim() || null
      : null;

  return resolve_session_preferred_sheet(
    db,
    mode,
    last_viewed_sheet,
    fixed_sheet_name,
  );
}
