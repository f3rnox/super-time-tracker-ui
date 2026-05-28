import { convert_db_to_json } from '@/lib/convert_db_to_json'
import { convert_json_db } from '@/lib/convert_json_db'
import { entry_matches_search_filters } from '@/lib/entry_matches_search_filters'
import { type EntryExportFilters } from '@/lib/types/entry_export'
import { type EntrySearchFilters } from '@/lib/types/entry_search'
import { type JSONTimeTrackerDB } from '@/lib/types'

/**
 * Returns a JSON database containing only entries that match export filters.
 */
export function filter_json_db_for_export(
  db: JSONTimeTrackerDB,
  filters: EntryExportFilters,
  reference_now_ms: number = Date.now(),
): JSONTimeTrackerDB {
  const time_db = convert_json_db(db)
  const search_filters: EntrySearchFilters = {
    query: '',
    ...filters,
  }
  const trimmed_sheet = filters.sheetName.trim()

  const filtered_sheets = time_db.sheets
    .filter((sheet) => {
      if (trimmed_sheet.length > 0 && sheet.name !== trimmed_sheet) {
        return false
      }

      return true
    })
    .map((sheet) => ({
      ...sheet,
      entries: sheet.entries.filter((entry) =>
        entry_matches_search_filters(
          entry,
          sheet.name,
          search_filters,
          reference_now_ms,
        ),
      ),
    }))
    .filter((sheet) => {
      if (trimmed_sheet.length > 0) {
        return true
      }

      return sheet.entries.length > 0
    })

  const active_sheet_name =
    time_db.activeSheetName !== null &&
    filtered_sheets.some((sheet) => sheet.name === time_db.activeSheetName)
      ? time_db.activeSheetName
      : (filtered_sheets[0]?.name ?? null)

  return convert_db_to_json({
    version: time_db.version,
    activeSheetName: active_sheet_name,
    sheets: filtered_sheets,
  })
}
