import { normalize_stored_tag } from '@/lib/normalize_stored_tag'
import { type TagStat } from '@/lib/types/tag_management'
import { type TimeTrackerDB } from '@/lib/types'

/**
 * Builds tag usage counts from every entry in the database.
 */
export function collect_tag_stats(db: TimeTrackerDB): TagStat[] {
  const counts = new Map<string, number>()

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      for (const tag of entry.tags) {
        try {
          const normalized = normalize_stored_tag(tag)
          counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
        } catch {
          continue
        }
      }
    }
  }

  return [...counts.entries()]
    .map(([name, entryCount]) => ({ name, entryCount }))
    .sort((left, right) => left.name.localeCompare(right.name))
}
