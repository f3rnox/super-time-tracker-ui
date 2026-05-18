/**
 * Formats a tag for display, ensuring it is prefixed with @.
 */
export function format_display_tag(tag: string): string {
  return tag.startsWith("@") ? tag : `@${tag}`;
}
