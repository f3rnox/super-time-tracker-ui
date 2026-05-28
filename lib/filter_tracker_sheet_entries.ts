import { filter_entries_by_tags } from "@/lib/filter_entries_by_tags";
import { filter_serialized_entries_by_search_query } from "@/lib/filter_serialized_entries_by_search_query";
import { sort_serialized_entries } from "@/lib/sort_serialized_entries";
import {
  type EntryListSort,
  type TagFilterMode,
} from "@/lib/types/ui_preferences";
import { type SerializedEntry } from "@/lib/types/tracker_state";

export interface FilterTrackerSheetEntriesArgs {
  entries: SerializedEntry[];
  show_archived_entries: boolean;
  filter_tags: readonly string[];
  tag_filter_mode: TagFilterMode;
  entry_search_query: string;
  entry_list_sort: EntryListSort;
}

/**
 * Applies visibility, tag, search, and sort filters to sheet entries for the tracker.
 */
export function filter_tracker_sheet_entries(
  args: FilterTrackerSheetEntriesArgs,
): SerializedEntry[] {
  const {
    entries,
    show_archived_entries,
    filter_tags,
    tag_filter_mode,
    entry_search_query,
    entry_list_sort,
  } = args;

  const visibility_filtered = entries.filter((entry) =>
    show_archived_entries ? entry.archived === true : entry.archived !== true,
  );

  const matching = filter_entries_by_tags(
    visibility_filtered,
    filter_tags,
    tag_filter_mode,
  );

  const searched = filter_serialized_entries_by_search_query(
    matching,
    entry_search_query,
  );

  return sort_serialized_entries(searched, entry_list_sort);
}
