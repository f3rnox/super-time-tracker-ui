import { write_stored_default_sheet_fixed_name } from '@/lib/write_stored_default_sheet_fixed_name'

/**
 * Updates which sheet opens when the session mode is set to a specific sheet.
 */
export function set_default_sheet_fixed_name(sheet_name: string): void {
  write_stored_default_sheet_fixed_name(sheet_name)
}
