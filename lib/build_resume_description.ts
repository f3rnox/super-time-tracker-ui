import { format_display_tag } from "@/lib/format_display_tag";

/**
 * Builds a check-in description from a prior entry's text and tags.
 */
export function build_resume_description(
  description: string,
  tags: string[],
): string {
  const trimmed = description.trim();
  const base = trimmed.length > 0 ? trimmed : "Untitled entry";
  const tag_text = tags.map((tag) => format_display_tag(tag)).join(" ");

  return tag_text.length > 0 ? `${base} ${tag_text}`.trim() : base;
}
