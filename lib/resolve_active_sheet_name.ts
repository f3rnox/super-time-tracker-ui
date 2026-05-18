import { DEFAULT_SHEET_NAME } from '@/lib/config'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Chooses which sheet to show: session preference, stored active sheet, then a running entry.
 */
export function resolve_active_sheet_name(
  db: TimeTrackerDB,
  preferred_sheet_name?: string | null,
): string {
  const trimmed_preference = preferred_sheet_name?.trim() ?? ''

  if (
    trimmed_preference.length > 0 &&
    db.sheets.some((sheet) => sheet.name === trimmed_preference)
  ) {
    return trimmed_preference
  }

  if (
    db.activeSheetName !== null &&
    db.sheets.some((sheet) => sheet.name === db.activeSheetName)
  ) {
    return db.activeSheetName
  }

  const sheet_with_active_entry = db.sheets.find(
    (sheet) => sheet.activeEntryID !== null,
  )

  if (sheet_with_active_entry !== undefined) {
    return sheet_with_active_entry.name
  }

  return db.sheets[0]?.name ?? DEFAULT_SHEET_NAME
}
