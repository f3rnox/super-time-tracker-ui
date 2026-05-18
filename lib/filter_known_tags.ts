/**
 * Returns known tags whose name matches the partial query after @.
 */
export function filter_known_tags(
  known_tags: string[],
  query: string,
  limit: number = 10,
): string[] {
  const normalized_query = query.toLowerCase()

  return known_tags
    .filter((tag) => {
      const name = tag.replace(/^@/, '').toLowerCase()

      return (
        normalized_query.length === 0 || name.startsWith(normalized_query)
      )
    })
    .slice(0, limit)
}
