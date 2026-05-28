import { notify_sheet_tag_filters_subscribers } from "@/lib/subscribe_sheet_tag_filters";
import { write_sheet_tag_filter } from "@/lib/write_sheet_tag_filter";

/**
 * Replaces the tag filter list for a sheet.
 */
export function set_sheet_tag_filter(
  sheet_name: string,
  filter_tags: string[],
): void {
  write_sheet_tag_filter(sheet_name, filter_tags);
  notify_sheet_tag_filters_subscribers();
}
