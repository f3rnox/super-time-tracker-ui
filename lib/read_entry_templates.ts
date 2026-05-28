import { type EntryTemplate } from "@/lib/types/entry_template";

const entry_templates_storage_key = "super-time-tracker-entry-templates";
const optional_string_keys = [
  "defaultSheetName",
  "shortcutKey",
  "createdAt",
  "lastUsedAt",
] as const;

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

const sanitize_entry_template = (template: EntryTemplate): EntryTemplate => {
  const sanitized: EntryTemplate = {
    id: template.id,
    name: template.name,
    description: template.description,
  };

  for (const key of optional_string_keys) {
    const value = template[key];

    if (typeof value === "string" && value.trim().length > 0) {
      sanitized[key] = value;
    }
  }

  if (Array.isArray(template.tags)) {
    sanitized.tags = template.tags.filter(
      (tag): tag is string => typeof tag === "string" && tag.length > 0,
    );
  }

  if (typeof template.favorite === "boolean") {
    sanitized.favorite = template.favorite;
  }

  if (typeof template.pomodoroLinked === "boolean") {
    sanitized.pomodoroLinked = template.pomodoroLinked;
  }

  if (
    typeof template.useCount === "number" &&
    Number.isFinite(template.useCount) &&
    template.useCount > 0
  ) {
    sanitized.useCount = Math.round(template.useCount);
  }

  return sanitized;
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

    return parsed.filter(is_entry_template).map(sanitize_entry_template);
  } catch {
    return [];
  }
}
