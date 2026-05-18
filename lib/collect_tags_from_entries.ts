import { normalize_stored_tag } from '@/lib/normalize_stored_tag'
import { type TagStat } from '@/lib/types/tag_management'
import { type SerializedEntry } from '@/lib/types/tracker_state'

/**
 * Builds tag usage counts from a list of serialized entries.
 */
export function collect_tags_from_entries(
  entries: SerializedEntry[],
): TagStat[] {
  const counts = new Map<string, number>()

  for (const entry of entries) {
    const seen_on_entry = new Set<string>()

    for (const tag of entry.tags) {
      try {
        const normalized = normalize_stored_tag(tag)

        if (seen_on_entry.has(normalized)) {
          continue
        }

        seen_on_entry.add(normalized)
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
      } catch {
        continue
      }
    }
  }

  return [...counts.entries()]
    .map(([name, entryCount]) => ({ name, entryCount }))
    .sort((left, right) => left.name.localeCompare(right.name))
}
