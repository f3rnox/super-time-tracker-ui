import { type TimeSheet } from "@/lib/types";

/**
 * Returns whether a sheet is archived (hidden from hub and sidebar).
 */
export function is_sheet_archived(sheet: Pick<TimeSheet, "archived">): boolean {
  return sheet.archived === true;
}
