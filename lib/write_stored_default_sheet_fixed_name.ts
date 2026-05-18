import {
  DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME,
  DEFAULT_SHEET_FIXED_NAME_STORAGE_KEY,
} from '@/lib/types/ui_settings'

/**
 * Persists the fixed default sheet name in localStorage and a cookie.
 */
export function write_stored_default_sheet_fixed_name(sheet_name: string): void {
  const trimmed = sheet_name.trim()

  if (trimmed.length === 0) {
    return
  }

  try {
    window.localStorage.setItem(DEFAULT_SHEET_FIXED_NAME_STORAGE_KEY, trimmed)
  } catch {
    // Ignore storage failures in private browsing.
  }

  try {
    const encoded = encodeURIComponent(trimmed)
    document.cookie = `${DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME}=${encoded}; Path=/; Max-Age=31536000; SameSite=Lax`
  } catch {
    // Ignore cookie failures.
  }
}
