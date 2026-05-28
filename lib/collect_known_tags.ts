import { type TimeTrackerDB } from "@/lib/types";

/**
 * Collects unique tags from every entry in the database.
 */
export function collect_known_tags(db: TimeTrackerDB): string[] {
  const tags = new Set<string>();

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      for (const tag of entry.tags) {
        const trimmed = tag.trim();

        if (trimmed.length > 0) {
          tags.add(trimmed);
        }
      }
    }
  }

  return [...tags].sort((left, right) => left.localeCompare(right));
}
