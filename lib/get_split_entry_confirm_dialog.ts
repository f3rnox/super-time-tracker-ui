import { type ConfirmDialogOptions } from '@/lib/types/confirm_dialog'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Builds confirm dialog options for splitting an entry.
 */
export function get_split_entry_confirm_dialog(
  entry: SerializedEntry,
  at: string,
): ConfirmDialogOptions {
  const description = entry.description.trim() || 'Untitled entry'

  return {
    title: 'Split entry?',
    message: `Split "${description}" at "${at}" into two entries?`,
    confirmLabel: 'Split',
  }
}
