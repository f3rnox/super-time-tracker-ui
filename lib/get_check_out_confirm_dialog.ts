import { type ConfirmDialogOptions } from '@/lib/types/confirm_dialog'

/**
 * Builds confirm dialog options for checking out of an active timer.
 */
export function get_check_out_confirm_dialog(at?: string): ConfirmDialogOptions {
  const trimmed_at = at?.trim() ?? ''
  const message =
    trimmed_at.length > 0
      ? `Stop the timer and check out at "${trimmed_at}"?`
      : 'Stop the active timer and save this entry?'

  return {
    title: 'Check out?',
    message,
    confirmLabel: 'Check out',
    variant: 'danger',
  }
}
