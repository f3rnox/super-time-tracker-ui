import { parse_default_sheet_session_mode } from '@/lib/parse_default_sheet_session_mode'
import {
  DEFAULT_SHEET_SESSION_MODE_STORAGE_KEY,
  type DefaultSheetSessionMode,
} from '@/lib/types/ui_settings'

/**
 * Reads the default sheet session mode from localStorage.
 */
export function read_stored_default_sheet_session_mode(): DefaultSheetSessionMode {
  try {
    const value = window.localStorage.getItem(DEFAULT_SHEET_SESSION_MODE_STORAGE_KEY)

    return parse_default_sheet_session_mode(value)
  } catch {
    return parse_default_sheet_session_mode(null)
  }
}
