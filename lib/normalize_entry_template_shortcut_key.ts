/**
 * Normalizes a template shortcut to a single supported key.
 */
export function normalize_entry_template_shortcut_key(
  value: string,
): string | undefined {
  const trimmed = value.trim().toLowerCase();

  if (/^[a-z0-9]$/.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}
