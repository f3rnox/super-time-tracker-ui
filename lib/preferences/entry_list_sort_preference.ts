import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  ENTRY_LIST_SORT_DEFAULT,
  ENTRY_LIST_SORT_STORAGE_KEY,
  type EntryListSort,
} from "@/lib/types/ui_preferences";

const is_entry_list_sort = (value: string): value is EntryListSort =>
  value === "newest" ||
  value === "oldest" ||
  value === "duration" ||
  value === "description";

/**
 * Default sort order for entry lists on the tracker home view.
 */
export const entry_list_sort_preference =
  create_ui_preference_store<EntryListSort>({
    storage_key: ENTRY_LIST_SORT_STORAGE_KEY,
    default_value: ENTRY_LIST_SORT_DEFAULT,
    is_valid: is_entry_list_sort,
  });
