/**
 * Prompts for note text to attach to a time sheet entry.
 */
export function prompt_entry_note(): string | null {
  const value = window.prompt("Add note", "");

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
}
