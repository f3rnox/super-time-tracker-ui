import { match_entry_search_query } from '@/lib/match_entry_search_query'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Filters serialized entries by a case-insensitive search query.
 */
export function filter_serialized_entries_by_search_query(
  entries: SerializedEntry[],
  query: string,
): SerializedEntry[] {
  const normalized_query = query.trim()

  if (normalized_query.length === 0) {
    return entries
  }

  return entries.filter((entry) =>
    match_entry_search_query(
      {
        sheetName: entry.sheetName,
        description: entry.description,
        tags: entry.tags,
        noteTexts: entry.notes.map((note) => note.text),
      },
      normalized_query,
    ).matches,
  )
}
