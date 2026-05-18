import { normalize_stored_tag } from '@/lib/normalize_stored_tag'
import { read_stored_sheet_tag_filters } from '@/lib/read_stored_sheet_tag_filters'

/**
 * Returns stored tag filters for a sheet, normalized and deduplicated.
 */
export function read_sheet_tag_filter(sheet_name: string): string[] {
  const stored = read_stored_sheet_tag_filters()[sheet_name] ?? []
  const normalized: string[] = []
  const seen = new Set<string>()

  for (const tag of stored) {
    try {
      const name = normalize_stored_tag(tag)

      if (!seen.has(name)) {
        seen.add(name)
        normalized.push(name)
      }
    } catch {
      continue
    }
  }

  return normalized
}
