import { type EntrySearchFilters, type EntrySearchPageData } from '@/lib/types/entry_search'

/**
 * Fetches entry search results from the API.
 */
export async function fetch_entry_search_results(
  filters: EntrySearchFilters,
): Promise<EntrySearchPageData> {
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

  const suffix = params.size > 0 ? `?${params.toString()}` : ''
  const response = await fetch(`/api/entries/search${suffix}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Failed to search entries')
  }

  return (await response.json()) as EntrySearchPageData
}
