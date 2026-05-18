import { type TimeSheet, type TimeTrackerDB } from '@/lib/types'

/**
 * Returns the sheet that has a running entry, if one exists.
 */
export function find_sheet_with_active_entry(
  db: TimeTrackerDB,
): TimeSheet | null {
  for (const sheet of db.sheets) {
    if (sheet.activeEntryID !== null) {
      return sheet
    }
  }

  return null
}
