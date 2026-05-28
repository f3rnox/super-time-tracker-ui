import {
  DEFAULT_SHEET_SESSION_MODE_DEFAULT,
  type DefaultSheetSessionMode,
} from "@/lib/types/ui_settings";

/**
 * Parses a stored default sheet session mode value.
 */
export function parse_default_sheet_session_mode(
  value: string | undefined | null,
): DefaultSheetSessionMode {
  if (
    value === "last_viewed" ||
    value === "active_timer" ||
    value === "fixed"
  ) {
    return value;
  }

  return DEFAULT_SHEET_SESSION_MODE_DEFAULT;
}
