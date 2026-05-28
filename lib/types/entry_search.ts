import { type EntryFacetFilters } from "@/lib/types/entry_facet_filters";
import { type SerializedEntry } from "@/lib/types/tracker_state";

export interface EntrySearchFilters extends EntryFacetFilters {
  query: string;
}

export interface EntrySearchPageData {
  entries: SerializedEntry[];
  totalCount: number;
  sheetNames: string[];
  tagNames: string[];
}
