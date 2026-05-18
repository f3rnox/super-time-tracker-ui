import { read_stored_sheet_tag_filters } from '@/lib/read_stored_sheet_tag_filters'
import { SHEET_TAG_FILTERS_STORAGE_KEY } from '@/lib/types/ui_settings'

/**
 * Persists per-sheet tag filter selections to localStorage.
 */
export function write_stored_sheet_tag_filters(
  filters: Record<string, string[]>,
): void {
  try {
    window.localStorage.setItem(
      SHEET_TAG_FILTERS_STORAGE_KEY,
      JSON.stringify(filters),
    )
  } catch {
    // Ignore storage failures in private browsing.
  }
}
