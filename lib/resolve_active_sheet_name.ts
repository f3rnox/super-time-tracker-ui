import { DEFAULT_SHEET_NAME } from "@/lib/config";
import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Chooses which sheet to show: session preference, stored active sheet, then a running entry.
 */
export function resolve_active_sheet_name(
  db: TimeTrackerDB,
  preferred_sheet_name?: string | null,
): string {
  const trimmed_preference = preferred_sheet_name?.trim() ?? "";

  if (
    trimmed_preference.length > 0 &&
    db.sheets.some(
      (sheet) => sheet.name === trimmed_preference && !is_sheet_archived(sheet),
    )
  ) {
    return trimmed_preference;
  }

  if (
    db.activeSheetName !== null &&
    db.sheets.some(
      (sheet) => sheet.name === db.activeSheetName && !is_sheet_archived(sheet),
    )
  ) {
    return db.activeSheetName;
  }

  const sheet_with_active_entry = db.sheets.find(
    (sheet) =>
      !is_sheet_archived(sheet) && find_running_entry_on_sheet(sheet) !== null,
  );

  if (sheet_with_active_entry !== undefined) {
    return sheet_with_active_entry.name;
  }

  const first_visible = db.sheets.find((sheet) => !is_sheet_archived(sheet));

  return first_visible?.name ?? DEFAULT_SHEET_NAME;
}
