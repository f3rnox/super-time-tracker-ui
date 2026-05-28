/**
 * Returns mean duration per entry, or zero when there are no entries.
 */
export function get_average_entry_ms(
  total_ms: number,
  entry_count: number,
): number {
  if (entry_count === 0) {
    return 0;
  }

  return total_ms / entry_count;
}
