/**
 * Formats the search results count line on the entry search page.
 */
export function format_search_result_count_label(total_count: number): string {
  if (total_count === 0) {
    return "No results";
  }

  if (total_count === 1) {
    return "1 result";
  }

  return `${total_count} results`;
}
