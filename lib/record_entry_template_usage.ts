import { read_entry_templates } from "@/lib/read_entry_templates";
import { write_entry_templates } from "@/lib/write_entry_templates";

/**
 * Records local usage metadata for a template after a successful check-in.
 */
export function record_entry_template_usage(template_id: string): void {
  const templates = read_entry_templates();
  const now = new Date().toISOString();
  let did_update = false;

  const next_templates = templates.map((template) => {
    if (template.id !== template_id) {
      return template;
    }

    did_update = true;
    return {
      ...template,
      lastUsedAt: now,
      useCount: (template.useCount ?? 0) + 1,
    };
  });

  if (did_update) {
    write_entry_templates(next_templates);
  }
}
