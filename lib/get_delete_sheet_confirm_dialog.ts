import { type ConfirmDialogOptions } from '@/lib/types/confirm_dialog'

/**
 * Builds confirm dialog options for deleting a time sheet.
 */
export function get_delete_sheet_confirm_dialog(
  sheet_name: string,
  entry_count: number,
  has_active_entry: boolean,
): ConfirmDialogOptions {
  const entry_note =
    entry_count === 0
      ? ''
      : ` This will delete ${entry_count} ${
          entry_count === 1 ? 'entry' : 'entries'
        }.`
  const active_note = has_active_entry ? ' This will stop the active timer.' : ''

  return {
    title: 'Delete sheet?',
    message: `Delete "${sheet_name}"?${entry_note}${active_note}`,
    confirmLabel: 'Delete sheet',
    variant: 'danger',
  }
}
