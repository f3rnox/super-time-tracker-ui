import { collect_known_tags } from "@/lib/collect_known_tags";
import { filter_visible_sheets } from "@/lib/filter_visible_sheets";
import { read_db } from "@/lib/read_db";
import { search_global_entries } from "@/lib/search_global_entries";
import {
  type EntrySearchFilters,
  type EntrySearchPageData,
} from "@/lib/types/entry_search";

/**
 * Loads sheet/tag options and search results for the entry search page.
 */
export async function get_entry_search_page_data(
  filters: EntrySearchFilters,
): Promise<EntrySearchPageData> {
  const db = await read_db();
  const { entries, totalCount } = search_global_entries(db, filters);

  return {
    entries,
    totalCount,
    sheetNames: filter_visible_sheets(db.sheets)
      .map((sheet) => sheet.name)
      .sort((left, right) => left.localeCompare(right)),
    tagNames: collect_known_tags(db),
  };
}
