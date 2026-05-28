'use client'

import Link from 'next/link'

import { build_entry_search_href } from '@/lib/build_entry_search_href'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { get_empty_entry_search_filters } from '@/lib/parse_entry_search_filters'

interface TrackerEntrySearchBarProps {
  query: string
  active_sheet: string
  is_pending?: boolean
  on_query_change: (query: string) => void
}

/**
 * Search bar for filtering entries on the tracker sheet view.
 */
export function TrackerEntrySearchBar({
  query,
  active_sheet,
  is_pending = false,
  on_query_change,
}: TrackerEntrySearchBarProps) {
  const trimmed_query = query.trim()
  const full_search_href = build_entry_search_href({
    ...get_empty_entry_search_filters(),
    query: trimmed_query,
    sheetName: active_sheet,
  })

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
          Search entries
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="search"
            className={get_input_class_name('compact')}
            placeholder="Search description, tags, notes…"
            value={query}
            disabled={is_pending}
            aria-label="Search entries on this sheet"
            onChange={(event) => on_query_change(event.target.value)}
          />
          {trimmed_query.length > 0 ? (
            <button
              type="button"
              className={get_button_class_name('ghost', 'small')}
              disabled={is_pending}
              onClick={() => on_query_change('')}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
      {trimmed_query.length > 0 ? (
        <Link
          className="self-start text-[0.8rem] font-semibold text-accent no-underline hover:underline"
          href={full_search_href}
        >
          Search all sheets with filters
        </Link>
      ) : (
        <Link
          className="self-start text-[0.8rem] font-semibold text-muted no-underline hover:text-accent hover:underline"
          href="/search"
        >
          Open global search
        </Link>
      )}
    </div>
  )
}
