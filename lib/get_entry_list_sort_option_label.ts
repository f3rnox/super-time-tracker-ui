import { type EntryListSort } from "@/lib/types/ui_preferences";

/**
 * Returns the settings label for an entry list sort option.
 */
export function get_entry_list_sort_option_label(value: EntryListSort): string {
  if (value === "newest") {
    return "Newest first";
  }

  if (value === "oldest") {
    return "Oldest first";
  }

  if (value === "duration") {
    return "Longest duration";
  }

  return "Description (A–Z)";
}
