import { get_sheet } from '@/lib/get_sheet'
import { read_db } from '@/lib/read_db'
import { write_db } from '@/lib/write_db'

export interface DeleteEntryRef {
  sheet_name: string
  entry_id: number
}

export interface DeleteEntriesArgs {
  entries: DeleteEntryRef[]
}

/**
 * Deletes multiple entries across sheets in a single database write.
 */
export async function delete_entries(args: DeleteEntriesArgs): Promise<void> {
  const { entries } = args

  if (entries.length === 0) {
    throw new Error('No entries selected')
  }

  const db = await read_db()
  const seen = new Set<string>()
  const by_sheet = new Map<string, number[]>()

  for (const { entry_id, sheet_name } of entries) {
    const key = `${sheet_name}:${entry_id}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    const list = by_sheet.get(sheet_name) ?? []
    list.push(entry_id)
    by_sheet.set(sheet_name, list)
  }

  for (const [sheet_name, ids] of by_sheet) {
    const sheet = get_sheet(db, sheet_name)
    const ids_to_remove = [...ids].sort((left, right) => right - left)

    for (const entry_id of ids_to_remove) {
      const entry_index = sheet.entries.findIndex(({ id }) => id === entry_id)

      if (entry_index === -1) {
        continue
      }

      if (sheet.activeEntryID === entry_id) {
        sheet.activeEntryID = null
      }

      sheet.entries.splice(entry_index, 1)
    }
  }

  await write_db(db)
}
