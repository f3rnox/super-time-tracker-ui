/**
 * Prompts for a natural-language split time such as "2 hours ago".
 */
export function prompt_split_entry_at(): string | null {
  const value = window.prompt("Split at what time?", "1 hour ago");

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
}
