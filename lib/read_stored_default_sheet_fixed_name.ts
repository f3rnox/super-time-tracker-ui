import { DEFAULT_SHEET_FIXED_NAME_STORAGE_KEY } from "@/lib/types/ui_settings";

/**
 * Reads the fixed default sheet name from localStorage.
 */
export function read_stored_default_sheet_fixed_name(): string | null {
  try {
    const value =
      window.localStorage
        .getItem(DEFAULT_SHEET_FIXED_NAME_STORAGE_KEY)
        ?.trim() ?? "";

    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}
