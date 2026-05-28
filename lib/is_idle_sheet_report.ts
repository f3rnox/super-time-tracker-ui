import { type SheetReportStats } from "@/lib/types/reporting";

/**
 * Returns whether a sheet has no entries or no tracked time.
 */
export function is_idle_sheet_report(sheet: SheetReportStats): boolean {
  return sheet.entryCount === 0 || sheet.totalMs === 0;
}
