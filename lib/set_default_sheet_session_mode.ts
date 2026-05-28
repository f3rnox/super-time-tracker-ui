import { write_stored_default_sheet_session_mode } from "@/lib/write_stored_default_sheet_session_mode";
import { type DefaultSheetSessionMode } from "@/lib/types/ui_settings";

/**
 * Updates the default sheet session mode preference.
 */
export function set_default_sheet_session_mode(
  mode: DefaultSheetSessionMode,
): void {
  write_stored_default_sheet_session_mode(mode);
}
