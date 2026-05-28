import { build_resume_description } from "@/lib/build_resume_description";
import { type EntryTemplate } from "@/lib/types/entry_template";

/**
 * Builds the check-in description for a template, including default tags.
 */
export function build_entry_template_description(
  template: EntryTemplate,
): string {
  return build_resume_description(template.description, template.tags ?? []);
}
