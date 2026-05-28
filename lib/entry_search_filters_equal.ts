import { type EntrySearchFilters } from "@/lib/types/entry_search";

/**
 * Returns whether two entry search filter objects are equivalent.
 */
export function entry_search_filters_equal(
  left: EntrySearchFilters,
  right: EntrySearchFilters,
): boolean {
  return (
    left.query.trim() === right.query.trim() &&
    left.sheetName.trim() === right.sheetName.trim() &&
    left.tag.trim() === right.tag.trim() &&
    left.fromDate.trim() === right.fromDate.trim() &&
    left.toDate.trim() === right.toDate.trim()
  );
}
