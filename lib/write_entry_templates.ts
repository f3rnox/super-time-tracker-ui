import { notify_entry_templates_changed } from "@/lib/subscribe_entry_templates";
import { type EntryTemplate } from "@/lib/types/entry_template";

const entry_templates_storage_key = "super-time-tracker-entry-templates";

/**
 * Persists check-in entry templates to local storage.
 */
export function write_entry_templates(templates: EntryTemplate[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      entry_templates_storage_key,
      JSON.stringify(templates),
    );
    notify_entry_templates_changed();
  } catch {
    // Ignore storage write failures.
  }
}
