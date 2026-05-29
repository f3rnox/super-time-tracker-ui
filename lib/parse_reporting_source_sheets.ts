import { type ReportingSourceSheet } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

/**
 * Restores time sheets from reporting source payloads.
 */
export function parse_reporting_source_sheets(
  source_sheets: ReportingSourceSheet[],
): TimeSheet[] {
  return source_sheets.map((sheet) => ({
    name: sheet.name,
    activeEntryID: sheet.activeEntryID,
    tasks: [],
    entries: sheet.entries.map((entry) => ({
      id: entry.id,
      start: new Date(entry.start),
      end: entry.end === null ? null : new Date(entry.end),
      description: "",
      tags: entry.tags,
      notes: [],
    })),
  }));
}
