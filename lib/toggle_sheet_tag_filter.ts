import { normalize_stored_tag } from "@/lib/normalize_stored_tag";
import { read_sheet_tag_filter } from "@/lib/read_sheet_tag_filter";
import { set_sheet_tag_filter } from "@/lib/set_sheet_tag_filter";
import { tags_are_equal } from "@/lib/tags_are_equal";

/**
 * Toggles a tag in the active sheet's filter list.
 */
export function toggle_sheet_tag_filter(sheet_name: string, tag: string): void {
  const normalized = normalize_stored_tag(tag);
  const current = read_sheet_tag_filter(sheet_name);
  const is_selected = current.some((filter_tag) =>
    tags_are_equal(filter_tag, normalized),
  );

  if (is_selected) {
    set_sheet_tag_filter(
      sheet_name,
      current.filter((filter_tag) => !tags_are_equal(filter_tag, normalized)),
    );
    return;
  }

  set_sheet_tag_filter(sheet_name, [...current, normalized]);
}
