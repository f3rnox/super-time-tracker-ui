/**
 * Formats a focus goal row name for display, prefixing tags with @ when needed.
 */
export function format_focus_goal_display_name(
  kind: "sheet" | "tag",
  name: string,
): string {
  if (kind === "tag" && !name.startsWith("@")) {
    return `@${name}`;
  }

  return name;
}
