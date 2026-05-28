import { EntrySearchView } from '@/components/entry-search-view'
import { get_entry_search_page_data } from '@/lib/get_entry_search_page_data'
import { parse_entry_search_filters_from_record } from '@/lib/parse_entry_search_filters'

/**
 * Global entry search route.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const filters = parse_entry_search_filters_from_record(params)
  const initial_data = await get_entry_search_page_data(filters)

  return <EntrySearchView initial_filters={filters} initial_data={initial_data} />
}
