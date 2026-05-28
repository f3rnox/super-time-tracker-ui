"use client";

import { EntryFacetFiltersPanel } from "@/components/entry-facet-filters";
import { get_empty_entry_search_filters } from "@/lib/parse_entry_search_filters";
import { type EntrySearchFilters } from "@/lib/types/entry_search";

type EntrySearchFiltersPanelProps = Readonly<{
  filters: EntrySearchFilters;
  sheet_names: string[];
  tag_names: string[];
  is_pending: boolean;
  on_change: (filters: EntrySearchFilters) => void;
}>;

/**
 * Filter controls for global entry search (sheet, tag, date range).
 */
export function EntrySearchFiltersPanel({
  filters,
  sheet_names,
  tag_names,
  is_pending,
  on_change,
}: EntrySearchFiltersPanelProps) {
  return (
    <EntryFacetFiltersPanel
      filters={filters}
      sheet_names={sheet_names}
      tag_names={tag_names}
      is_pending={is_pending}
      on_change={(facet_filters) =>
        on_change({
          ...filters,
          ...facet_filters,
        })
      }
      on_clear={() =>
        on_change({
          ...get_empty_entry_search_filters(),
          query: filters.query,
        })
      }
    />
  );
}
