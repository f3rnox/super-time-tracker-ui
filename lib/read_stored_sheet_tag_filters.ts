import { SHEET_TAG_FILTERS_STORAGE_KEY } from "@/lib/types/ui_settings";

/**
 * Reads per-sheet tag filter selections from localStorage.
 */
export function read_stored_sheet_tag_filters(): Record<string, string[]> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(SHEET_TAG_FILTERS_STORAGE_KEY);

    if (raw === null) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, string[]>;

    if (parsed === null || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}
