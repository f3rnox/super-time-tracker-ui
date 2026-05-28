/**
 * Formats an entry count for list section headers.
 */
export function format_entry_count_label(count: number): string | null {
  if (count === 0) {
    return null;
  }

  if (count === 1) {
    return "1 entry";
  }

  return `${count} entries`;
}
