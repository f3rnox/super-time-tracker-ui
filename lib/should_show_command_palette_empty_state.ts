/**
 * Whether the command palette should show the empty-results message.
 */
export function should_show_command_palette_empty_state(
  is_loading: boolean,
  item_count: number,
  error: string | null,
): boolean {
  return !is_loading && item_count === 0 && error === null;
}
