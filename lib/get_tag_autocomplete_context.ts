export interface TagAutocompleteContext {
  query: string;
  start_index: number;
  end_index: number;
}

/**
 * Returns tag autocomplete context when the cursor is after an open @ token.
 */
export function get_tag_autocomplete_context(
  text: string,
  cursor_index: number,
): TagAutocompleteContext | null {
  const before_cursor = text.slice(0, cursor_index);
  const at_index = before_cursor.lastIndexOf("@");

  if (at_index === -1) {
    return null;
  }

  const query = before_cursor.slice(at_index + 1);

  if (/\s/.test(query)) {
    return null;
  }

  return {
    query,
    start_index: at_index,
    end_index: cursor_index,
  };
}
