import { normalize_stored_tag } from "@/lib/normalize_stored_tag";

/**
 * Returns whether the partial @ query is a finished known tag name.
 */
export function is_complete_tag_autocomplete_query(
  query: string,
  known_tags: string[],
): boolean {
  if (!/^\w+$/.test(query)) {
    return false;
  }

  const normalized_query = query.toLowerCase();

  return known_tags.some((tag) => {
    try {
      return (
        normalize_stored_tag(tag).slice(1).toLowerCase() === normalized_query
      );
    } catch {
      return false;
    }
  });
}
