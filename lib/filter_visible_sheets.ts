import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { type TimeSheet } from "@/lib/types";

/**
 * Returns sheets that are not archived.
 */
export function filter_visible_sheets(sheets: TimeSheet[]): TimeSheet[] {
  return sheets.filter((sheet) => !is_sheet_archived(sheet));
}
