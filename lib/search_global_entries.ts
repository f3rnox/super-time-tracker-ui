import { entry_matches_search_filters } from '@/lib/entry_matches_search_filters'
import { match_entry_search_query } from '@/lib/match_entry_search_query'
import { serialize_entry } from '@/lib/serialize_entry'
import { type EntrySearchFilters } from '@/lib/types/entry_search'
import { type SerializedEntry } from '@/lib/types/tracker_state'
import { type TimeTrackerDB } from '@/lib/types'

export interface SearchGlobalEntriesOptions {
  limit?: number
  offset?: number
  referenceNowMs?: number
}

export interface SearchGlobalEntriesResult {
  entries: SerializedEntry[]
  totalCount: number
}

const default_limit = 100

/**
 * Searches all tracker entries with optional text and facet filters.
 */
export function search_global_entries(
  db: TimeTrackerDB,
  filters: EntrySearchFilters,
  options: SearchGlobalEntriesOptions = {},
): SearchGlobalEntriesResult {
  const limit = options.limit ?? default_limit
  const offset = options.offset ?? 0
  const reference_now_ms = options.referenceNowMs ?? Date.now()
  const matches: SerializedEntry[] = []

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      if (!entry_matches_search_filters(entry, sheet.name, filters, reference_now_ms)) {
        continue
      }

      const query_match = match_entry_search_query(
        {
          sheetName: sheet.name,
          description: entry.description,
          tags: entry.tags,
          noteTexts: entry.notes.map((note) => note.text),
        },
        filters.query,
      )

      if (!query_match.matches) {
        continue
      }

      matches.push(
        serialize_entry(
          entry,
          sheet.name,
          sheet.activeEntryID === entry.id && entry.end === null,
        ),
      )
    }
  }

  matches.sort((left, right) => right.start.localeCompare(left.start))

  return {
    entries: matches.slice(offset, offset + limit),
    totalCount: matches.length,
  }
}
