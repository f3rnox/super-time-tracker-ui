import {
  type SheetReportSort,
  type SheetReportStats,
} from "@/lib/types/reporting";

/**
 * Returns a new array of sheet report stats in the requested order.
 */
export function sort_sheet_report_stats(
  sheets: SheetReportStats[],
  sort: SheetReportSort,
): SheetReportStats[] {
  const sorted = [...sheets];

  switch (sort) {
    case "name":
      sorted.sort((left, right) =>
        left.sheetName.localeCompare(right.sheetName),
      );
      break;
    case "entry_count":
      sorted.sort((left, right) => {
        if (right.entryCount !== left.entryCount) {
          return right.entryCount - left.entryCount;
        }

        return right.totalMs - left.totalMs;
      });
      break;
    case "active_first":
      sorted.sort((left, right) => {
        if (left.hasActiveEntry !== right.hasActiveEntry) {
          return left.hasActiveEntry ? -1 : 1;
        }

        return right.totalMs - left.totalMs;
      });
      break;
    case "duration":
    default:
      sorted.sort((left, right) => right.totalMs - left.totalMs);
      break;
  }

  return sorted;
}
