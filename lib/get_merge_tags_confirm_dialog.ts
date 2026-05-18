import { type ConfirmDialogOptions } from '@/lib/types/confirm_dialog'
import { format_display_tag } from '@/lib/format_display_tag'

/**
 * Builds confirm dialog options for merging tags.
 */
export function get_merge_tags_confirm_dialog(
  source_tags: string[],
  target_tag: string,
  entry_count: number,
): ConfirmDialogOptions {
  const source_label = source_tags.map((tag) => format_display_tag(tag)).join(', ')
  const target_label = format_display_tag(target_tag)
  const entry_note =
    entry_count === 1
      ? '1 entry will be updated.'
      : `${entry_count} entries will be updated.`

  return {
    title: 'Merge tags?',
    message: `Merge ${source_label} into ${target_label}? ${entry_note}`,
    confirmLabel: 'Merge tags',
    variant: 'danger',
  }
}
