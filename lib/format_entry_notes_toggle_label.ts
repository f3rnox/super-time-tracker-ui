/**
 * Formats the expand/collapse label for an entry notes list.
 */
export function format_entry_notes_toggle_label(
  note_count: number,
  is_inline: boolean,
): string {
  if (is_inline) {
    const noun = note_count === 1 ? "note" : "notes";
    return `${note_count} ${noun}`;
  }

  return `Notes (${note_count})`;
}
