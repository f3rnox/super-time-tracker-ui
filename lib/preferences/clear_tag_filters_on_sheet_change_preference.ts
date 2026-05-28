import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  CLEAR_TAG_FILTERS_ON_SHEET_CHANGE_DEFAULT,
  CLEAR_TAG_FILTERS_ON_SHEET_CHANGE_STORAGE_KEY,
  type ClearTagFiltersOnSheetChange,
} from "@/lib/types/ui_preferences";

const is_clear_tag_filters_on_sheet_change = (
  value: string,
): value is ClearTagFiltersOnSheetChange =>
  value === "true" || value === "false";

/**
 * Whether tag filters reset whenever the active sheet changes.
 */
export const clear_tag_filters_on_sheet_change_preference =
  create_ui_preference_store<ClearTagFiltersOnSheetChange>({
    storage_key: CLEAR_TAG_FILTERS_ON_SHEET_CHANGE_STORAGE_KEY,
    default_value: CLEAR_TAG_FILTERS_ON_SHEET_CHANGE_DEFAULT,
    is_valid: is_clear_tag_filters_on_sheet_change,
  });
