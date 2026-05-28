import { get_date_range_ms_from_inputs } from "@/lib/get_date_range_ms_from_inputs";
import { entry_overlaps_date_range } from "@/lib/entry_overlaps_date_range";
import { tags_are_equal } from "@/lib/tags_are_equal";
import { type EntrySearchFilters } from "@/lib/types/entry_search";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns whether an entry passes sheet, tag, and date filters.
 */
export function entry_matches_search_filters(
  entry: TimeSheetEntry,
  sheet_name: string,
  filters: EntrySearchFilters,
  reference_now_ms: number = Date.now(),
): boolean {
  const trimmed_sheet = filters.sheetName.trim();

  if (trimmed_sheet.length > 0 && sheet_name !== trimmed_sheet) {
    return false;
  }

  const trimmed_tag = filters.tag.trim();

  if (
    trimmed_tag.length > 0 &&
    !entry.tags.some((tag) => tags_are_equal(tag, trimmed_tag))
  ) {
    return false;
  }

  const date_range = get_date_range_ms_from_inputs(
    filters.fromDate.trim(),
    filters.toDate.trim(),
  );

  if (date_range === null) {
    return true;
  }

  return entry_overlaps_date_range(entry, date_range, reference_now_ms);
}
