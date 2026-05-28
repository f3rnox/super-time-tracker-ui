import { type DefaultSheetSessionMode } from "@/lib/types/ui_settings";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Resolves which sheet name to prefer on a new session before DB fallbacks.
 */
export function resolve_session_preferred_sheet(
  db: TimeTrackerDB,
  mode: DefaultSheetSessionMode,
  last_viewed_sheet: string | null,
  fixed_sheet_name: string | null,
): string | null {
  switch (mode) {
    case "fixed": {
      const trimmed = fixed_sheet_name?.trim() ?? "";

      if (
        trimmed.length > 0 &&
        db.sheets.some((sheet) => sheet.name === trimmed)
      ) {
        return trimmed;
      }

      return null;
    }
    case "active_timer": {
      const sheet_with_timer = db.sheets.find(
        (sheet) => sheet.activeEntryID !== null,
      );

      return sheet_with_timer?.name ?? null;
    }
    case "last_viewed":
    default:
      return last_viewed_sheet;
  }
}
