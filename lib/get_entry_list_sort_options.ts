import { type EntryListSort } from "@/lib/types/ui_preferences";

/**
 * Returns sort options for the active sheet entry list.
 */
export function get_entry_list_sort_options(): {
  value: EntryListSort;
  label: string;
}[] {
  return [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "duration", label: "Duration" },
    { value: "description", label: "Description" },
  ];
}
