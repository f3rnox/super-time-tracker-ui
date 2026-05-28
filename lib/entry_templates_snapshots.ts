import { type EntryTemplate } from "@/lib/types/entry_template";

/**
 * Stable empty entry templates list for useSyncExternalStore snapshots.
 */
export const EMPTY_ENTRY_TEMPLATES: readonly EntryTemplate[] = [];

interface EntryTemplatesSnapshotCache {
  templates_key: string;
  snapshot: readonly EntryTemplate[];
}

let snapshot_cache: EntryTemplatesSnapshotCache | null = null;

/**
 * Clears the cached entry templates snapshot.
 */
export function reset_entry_templates_snapshot_cache(): void {
  snapshot_cache = null;
}

/**
 * Returns a stable snapshot reference for the given template list.
 */
export function get_stable_entry_templates_snapshot(
  templates: EntryTemplate[],
): readonly EntryTemplate[] {
  const templates_key = templates
    .map((template) =>
      [
        template.id,
        template.name,
        template.description,
        template.defaultSheetName ?? "",
        template.tags?.join(" ") ?? "",
        template.favorite === true ? "1" : "0",
        template.shortcutKey ?? "",
        template.pomodoroLinked === true ? "1" : "0",
        template.createdAt ?? "",
        template.lastUsedAt ?? "",
        String(template.useCount ?? 0),
      ].join("\0"),
    )
    .join("\n");

  if (
    snapshot_cache !== null &&
    snapshot_cache.templates_key === templates_key
  ) {
    return snapshot_cache.snapshot;
  }

  const snapshot =
    templates.length === 0
      ? EMPTY_ENTRY_TEMPLATES
      : Object.freeze(templates.map((template) => ({ ...template })));

  snapshot_cache = {
    templates_key,
    snapshot,
  };

  return snapshot;
}
