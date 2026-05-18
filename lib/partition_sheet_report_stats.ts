import { is_idle_sheet_report } from '@/lib/is_idle_sheet_report'
import { type SheetReportStats } from '@/lib/types/reporting'

export interface PartitionedSheetReportStats {
  activeSheets: SheetReportStats[]
  idleSheets: SheetReportStats[]
}

/**
 * Splits sheet report stats into tracked and empty or idle groups.
 */
export function partition_sheet_report_stats(
  sheets: SheetReportStats[],
): PartitionedSheetReportStats {
  const active_sheets: SheetReportStats[] = []
  const idle_sheets: SheetReportStats[] = []

  for (const sheet of sheets) {
    if (is_idle_sheet_report(sheet)) {
      idle_sheets.push(sheet)
    } else {
      active_sheets.push(sheet)
    }
  }

  return {
    activeSheets: active_sheets,
    idleSheets: idle_sheets,
  }
}
