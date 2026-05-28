import { type TagFilterMode } from "@/lib/types/ui_preferences";

export interface GetTrackerEntriesEmptyMessageArgs {
  active_sheet: string;
  is_switching_sheet: boolean;
  is_loading_entries: boolean;
  show_archived_entries: boolean;
  entry_search_query: string;
  filter_tags: readonly string[];
  tag_filter_mode: TagFilterMode;
}

/**
 * Builds the empty-state copy for the tracker entry list.
 */
export function get_tracker_entries_empty_message(
  args: GetTrackerEntriesEmptyMessageArgs,
): string {
  const {
    active_sheet,
    is_switching_sheet,
    is_loading_entries,
    show_archived_entries,
    entry_search_query,
    filter_tags,
    tag_filter_mode,
  } = args;

  if (is_switching_sheet || is_loading_entries) {
    return `Loading entries for "${active_sheet}"…`;
  }

  if (show_archived_entries) {
    return `No archived entries on sheet "${active_sheet}".`;
  }

  const has_search = entry_search_query.trim().length > 0;
  const has_tags = filter_tags.length > 0;

  if (has_search && has_tags) {
    return `No entries on sheet "${active_sheet}" match your search and selected tags.`;
  }

  if (has_search) {
    return `No entries on sheet "${active_sheet}" match your search.`;
  }

  if (has_tags && tag_filter_mode === "any") {
    return `No entries on sheet "${active_sheet}" match any selected tag.`;
  }

  if (has_tags) {
    return `No entries on sheet "${active_sheet}" match all selected tags.`;
  }

  return `No entries on sheet "${active_sheet}".`;
}
