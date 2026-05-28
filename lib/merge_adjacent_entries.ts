import { get_sheet } from '@/lib/get_sheet'
import { read_db } from '@/lib/read_db'
import { validate_entry_times } from '@/lib/validate_entry_times'
import { write_db } from '@/lib/write_db'
import { type MergeEntryDirection } from '@/lib/get_mergeable_entry_neighbors'
import { type TimeSheetEntry } from '@/lib/types'

export interface MergeAdjacentEntriesArgs {
  sheet_name: string
  entry_id: number
  direction: MergeEntryDirection
}

/**
 * Merges an entry with its touching previous or next neighbor on the same sheet.
 */
export async function merge_adjacent_entries(
  args: MergeAdjacentEntriesArgs,
): Promise<TimeSheetEntry> {
  const { direction, entry_id, sheet_name } = args
  const db = await read_db()
  const sheet = get_sheet(db, sheet_name)
  const entry_index = sheet.entries.findIndex((candidate) => candidate.id === entry_id)

  if (entry_index === -1) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`)
  }

  const entry = sheet.entries[entry_index]

  if (sheet.activeEntryID === entry_id) {
    throw new Error('Cannot merge the active entry')
  }

  if (entry.end === null) {
    throw new Error('Cannot merge an entry without an end time')
  }

  const sorted = [...sheet.entries].sort(
    (left, right) => +left.start - +right.start,
  )
  const sorted_index = sorted.findIndex((candidate) => candidate.id === entry_id)

  if (sorted_index < 0) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`)
  }

  const neighbor =
    direction === 'previous'
      ? sorted_index > 0
        ? sorted[sorted_index - 1]
        : undefined
      : sorted_index < sorted.length - 1
        ? sorted[sorted_index + 1]
        : undefined

  if (neighbor === undefined) {
    throw new Error(`No ${direction} entry to merge with`)
  }

  if (sheet.activeEntryID === neighbor.id) {
    throw new Error('Cannot merge with the active entry')
  }

  if (neighbor.end === null) {
    throw new Error('Cannot merge with an entry without an end time')
  }

  const earlier = direction === 'previous' ? neighbor : entry
  const later = direction === 'previous' ? entry : neighbor

  if (+earlier.end !== +later.start) {
    throw new Error('Entries must be adjacent with no gap between them')
  }

  const merged_tags = [...new Set([...earlier.tags, ...later.tags])]
  const merged_notes = [...earlier.notes, ...later.notes].sort(
    (left, right) => +left.timestamp - +right.timestamp,
  )

  earlier.end = later.end
  earlier.tags = merged_tags
  earlier.notes = merged_notes

  if (later.description.trim().length > 0 && later.description !== earlier.description) {
    const earlier_description = earlier.description.trim()
    const later_description = later.description.trim()

    earlier.description =
      earlier_description.length > 0
        ? `${earlier_description} / ${later_description}`
        : later_description
  }

  validate_entry_times(earlier.start, earlier.end)

  const later_index = sheet.entries.findIndex((candidate) => candidate.id === later.id)

  if (later_index === -1) {
    throw new Error(`Entry ${later.id} not found in sheet ${sheet_name}`)
  }

  sheet.entries.splice(later_index, 1)

  await write_db(db)

  return earlier
}
