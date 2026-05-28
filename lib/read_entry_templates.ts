import { type EntryTemplate } from "@/lib/types/entry_template";

const entry_templates_storage_key = "super-time-tracker-entry-templates";

const is_entry_template = (value: unknown): value is EntryTemplate => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.description === "string"
  );
};

/**
 * Reads check-in entry templates from local storage.
 */
export function read_entry_templates(): EntryTemplate[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(entry_templates_storage_key);

    if (raw === null) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(is_entry_template);
  } catch {
    return [];
  }
}
