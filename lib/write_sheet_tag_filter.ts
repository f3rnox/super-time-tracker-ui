import { read_stored_sheet_tag_filters } from "@/lib/read_stored_sheet_tag_filters";
import { write_stored_sheet_tag_filters } from "@/lib/write_stored_sheet_tag_filters";

/**
 * Updates one sheet's tag filter list in localStorage.
 */
export function write_sheet_tag_filter(
  sheet_name: string,
  filter_tags: string[],
): void {
  const filters = read_stored_sheet_tag_filters();

  if (filter_tags.length === 0) {
    delete filters[sheet_name];
  } else {
    filters[sheet_name] = filter_tags;
  }

  write_stored_sheet_tag_filters(filters);
}
