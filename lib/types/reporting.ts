export type SheetReportSort = 'duration' | 'name' | 'entry_count' | 'active_first'

export interface ReportingDateRangeInputs {
  from_date: string
  to_date: string
}

export type ReportingDateRangeShortcut =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'last_month'
  | 'year'
  | 'last_year'

export interface ReportingSourceEntry {
  id: number
  start: string
  end: string | null
}

export interface ReportingSourceSheet {
  name: string
  activeEntryID: number | null
  entries: ReportingSourceEntry[]
}

/**
 * Time-tracking aggregates for a single sheet.
 */
export interface SheetReportStats {
  sheetName: string
  totalMs: number
  entryCount: number
  averageEntryMs: number
  hasActiveEntry: boolean
}

/**
 * Time tracked within calendar periods, clipped to period boundaries.
 */
export interface ReportingPeriodTotals {
  todayMs: number
  weekMs: number
  monthMs: number
}

/**
 * Cross-sheet reporting snapshot for the reporting view.
 */
export interface ReportingStats {
  activeSheets: SheetReportStats[]
  idleSheets: SheetReportStats[]
  grandTotalMs: number
  totalEntryCount: number
  grandAverageEntryMs: number
  periodTotals: ReportingPeriodTotals
}
