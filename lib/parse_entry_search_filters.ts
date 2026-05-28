import { type EntrySearchFilters } from '@/lib/types/entry_search'

const empty_filters: EntrySearchFilters = {
  query: '',
  sheetName: '',
  tag: '',
  fromDate: '',
  toDate: '',
}

/**
 * Parses entry search filters from URL search params.
 */
export function parse_entry_search_filters(
  search_params: URLSearchParams,
): EntrySearchFilters {
  return {
    query: search_params.get('q')?.trim() ?? '',
    sheetName: search_params.get('sheet')?.trim() ?? '',
    tag: search_params.get('tag')?.trim() ?? '',
    fromDate: search_params.get('from')?.trim() ?? '',
    toDate: search_params.get('to')?.trim() ?? '',
  }
}

/**
 * Parses entry search filters from a Next.js searchParams record.
 */
export function parse_entry_search_filters_from_record(
  params: Record<string, string | string[] | undefined>,
): EntrySearchFilters {
  const search_params = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      search_params.set(key, value)
      continue
    }

    if (Array.isArray(value) && value[0] !== undefined) {
      search_params.set(key, value[0])
    }
  }

  return parse_entry_search_filters(search_params)
}

/**
 * Returns default empty entry search filters.
 */
export function get_empty_entry_search_filters(): EntrySearchFilters {
  return { ...empty_filters }
}
