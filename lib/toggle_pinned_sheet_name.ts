import {
  read_pinned_sheet_names,
  write_pinned_sheet_names,
} from '@/lib/pinned_sheet_names_store'

/**
 * Adds or removes a sheet name from the pinned list.
 */
export function toggle_pinned_sheet_name(sheet_name: string): void {
  const trimmed = sheet_name.trim()

  if (trimmed.length === 0) {
    return
  }

  const current = read_pinned_sheet_names()
  const index = current.indexOf(trimmed)

  if (index >= 0) {
    write_pinned_sheet_names([
      ...current.slice(0, index),
      ...current.slice(index + 1),
    ])
    return
  }

  write_pinned_sheet_names([...current, trimmed])
}
