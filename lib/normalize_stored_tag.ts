/**
 * Normalizes user input into a stored @tag token.
 */
export function normalize_stored_tag(tag: string): string {
  const without_at = tag.trim().replace(/^@+/, "");

  if (without_at.length === 0) {
    throw new Error("Tag name must not be empty.");
  }

  if (!/^\w+$/.test(without_at)) {
    throw new Error("Tags may only contain letters, numbers, and underscores.");
  }

  return `@${without_at}`;
}
