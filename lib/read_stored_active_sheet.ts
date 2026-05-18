import { ACTIVE_SHEET_STORAGE_KEY } from '@/lib/types/ui_settings'

/**
 * Reads the last opened sheet from localStorage (client-only).
 */
export function read_stored_active_sheet(): string | null {
  try {
    const value = window.localStorage.getItem(ACTIVE_SHEET_STORAGE_KEY)?.trim() ?? ''

    return value.length > 0 ? value : null
  } catch {
    return null
  }
}
