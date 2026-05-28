import { type ReportingSourceSheet } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

/**
 * Serializes time sheets for client-side reporting calculations.
 */
export function serialize_reporting_source_sheets(
  sheets: TimeSheet[],
): ReportingSourceSheet[] {
  return sheets.map((sheet) => ({
    name: sheet.name,
    activeEntryID: sheet.activeEntryID,
    entries: sheet.entries.map((entry) => ({
      id: entry.id,
      start: entry.start.toISOString(),
      end: entry.end === null ? null : entry.end.toISOString(),
      tags: entry.tags,
    })),
  }));
}
