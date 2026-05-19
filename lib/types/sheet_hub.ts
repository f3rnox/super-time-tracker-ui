/**
 * Per-sheet summary row for the sheet hub view.
 */
export interface SheetHubRow {
  sheetName: string
  entryCount: number
  hasActiveEntry: boolean
  weekTotalMs: number
  monthTotalMs: number
  lastActivityAt: string | null
}
