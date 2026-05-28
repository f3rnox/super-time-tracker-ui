/**
 * Prompts for a natural-language checkout time such as "30 minutes ago".
 */
export function prompt_check_out_at(): string | null {
  const value = window.prompt("Check out at what time?", "30 minutes ago");

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
}
