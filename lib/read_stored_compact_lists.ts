import {
  COMPACT_LISTS_STORAGE_KEY,
} from "@/lib/types/ui_settings";

/**
 * Reads the persisted compact lists setting from localStorage.
 */
export function read_stored_compact_lists(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(COMPACT_LISTS_STORAGE_KEY);

  if (stored === "true") {
    return true;
  }

  if (stored === "false") {
    return false;
  }

  return null;
}
