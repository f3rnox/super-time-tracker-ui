import { read_sheet_tag_filter } from "@/lib/read_sheet_tag_filter";
import { set_sheet_tag_filter } from "@/lib/set_sheet_tag_filter";
import { tags_are_equal } from "@/lib/tags_are_equal";

/**
 * Drops filter tags that no longer appear on the sheet.
 */
export function prune_sheet_tag_filter(
  sheet_name: string,
  available_tags: string[],
): void {
  const current = read_sheet_tag_filter(sheet_name);

  if (current.length === 0) {
    return;
  }

  const pruned = current.filter((filter_tag) =>
    available_tags.some((available_tag) =>
      tags_are_equal(filter_tag, available_tag),
    ),
  );

  if (pruned.length !== current.length) {
    set_sheet_tag_filter(sheet_name, pruned);
  }
}
