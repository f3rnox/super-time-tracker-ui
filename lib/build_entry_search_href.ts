import { type EntrySearchFilters } from '@/lib/types/entry_search'

/**
 * Builds a /search href from entry search filters.
 */
export function build_entry_search_href(filters: EntrySearchFilters): string {
  const params = new URLSearchParams()

  if (filters.query.trim().length > 0) {
    params.set('q', filters.query.trim())
  }

  if (filters.sheetName.trim().length > 0) {
    params.set('sheet', filters.sheetName.trim())
  }

  if (filters.tag.trim().length > 0) {
    params.set('tag', filters.tag.trim())
  }

  if (filters.fromDate.trim().length > 0) {
    params.set('from', filters.fromDate.trim())
  }

  if (filters.toDate.trim().length > 0) {
    params.set('to', filters.toDate.trim())
  }

  const query = params.toString()

  return query.length > 0 ? `/search?${query}` : '/search'
}
