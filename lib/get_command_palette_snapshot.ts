import { find_last_completed_entry } from '@/lib/find_last_completed_entry'
import { read_db } from '@/lib/read_db'
import { search_command_palette_entries } from '@/lib/search_command_palette_entries'
import {
  type CommandPaletteEntrySnapshot,
  type CommandPaletteSnapshot,
} from '@/lib/types/command_palette'

const recent_entry_limit = 8

/**
 * Builds command palette data from the tracker database.
 */
export async function get_command_palette_snapshot(
  query?: string,
): Promise<CommandPaletteSnapshot> {
  const db = await read_db()
  const normalized_query = query?.trim() ?? ''
  const last_completed = find_last_completed_entry(db)

  const lastCompletedEntry: CommandPaletteEntrySnapshot | null =
    last_completed === null
      ? null
      : {
          id: last_completed.entry.id,
          sheetName: last_completed.sheetName,
          description: last_completed.entry.description,
          tags: last_completed.entry.tags,
          end: last_completed.entry.end!.toISOString(),
        }

  const matchingEntries =
    normalized_query.length > 0
      ? search_command_palette_entries(db, normalized_query)
      : collect_recent_completed_entries(db, recent_entry_limit)

  return {
    activeSheetName: db.activeSheetName,
    sheets: db.sheets.map((sheet) => ({
      name: sheet.name,
      hasActiveEntry: sheet.activeEntryID !== null,
    })),
    lastCompletedEntry,
    matchingEntries,
  }
}

function collect_recent_completed_entries(
  db: Awaited<ReturnType<typeof read_db>>,
  limit: number,
): CommandPaletteEntrySnapshot[] {
  const completed: CommandPaletteEntrySnapshot[] = []

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      if (entry.end === null) {
        continue
      }

      completed.push({
        id: entry.id,
        sheetName: sheet.name,
        description: entry.description,
        tags: entry.tags,
        end: entry.end.toISOString(),
      })
    }
  }

  completed.sort((left, right) => right.end.localeCompare(left.end))

  return completed.slice(0, limit)
}
