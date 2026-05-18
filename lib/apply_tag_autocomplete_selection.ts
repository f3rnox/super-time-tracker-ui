import { format_display_tag } from '@/lib/format_display_tag'
import { type TagAutocompleteContext } from '@/lib/get_tag_autocomplete_context'

export interface TagAutocompleteSelectionResult {
  next_text: string
  next_cursor: number
}

/**
 * Inserts a selected tag into the description at the active @ token.
 */
export function apply_tag_autocomplete_selection(
  text: string,
  context: TagAutocompleteContext,
  tag: string,
): TagAutocompleteSelectionResult {
  const formatted_tag = format_display_tag(tag)
  const before = text.slice(0, context.start_index)
  const after = text.slice(context.end_index)
  const next_text = `${before}${formatted_tag}${after}`

  return {
    next_text,
    next_cursor: before.length + formatted_tag.length,
  }
}
