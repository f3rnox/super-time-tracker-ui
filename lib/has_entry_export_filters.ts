import { type EntryExportFilters } from '@/lib/types/entry_export'

/**
 * Returns whether any export scope filter is active.
 */
export function has_entry_export_filters(filters: EntryExportFilters): boolean {
  return (
    filters.sheetName.trim().length > 0 ||
    filters.tag.trim().length > 0 ||
    filters.fromDate.trim().length > 0 ||
    filters.toDate.trim().length > 0
  )
}
