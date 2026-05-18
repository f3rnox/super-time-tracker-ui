import { DB_PATH } from '@/lib/config'
import { get_sheet } from '@/lib/get_sheet'
import { get_serialized_entries_total_ms } from '@/lib/get_serialized_entries_total_ms'
import { is_entry_in_day } from '@/lib/is_entry_in_day'
import { read_db } from '@/lib/read_db'
import { serialize_entry } from '@/lib/serialize_entry'
import { serialize_sheet_entries } from '@/lib/serialize_sheet_entries'
import { sort_serialized_entries } from '@/lib/sort_serialized_entries'
import {
  type SerializedEntry,
  type TrackerState,
} from '@/lib/types/tracker_state'

/**
 * Builds the tracker snapshot consumed by the web UI.
 */
export async function get_tracker_state(): Promise<TrackerState> {
  const db = await read_db()
  const today = new Date()
  const { activeSheetName, sheets } = db

  let active_entry: SerializedEntry | null = null
  let active_sheet_entries: SerializedEntry[] = []

  if (activeSheetName !== null) {
    const sheet = get_sheet(db, activeSheetName)
    const { activeEntryID, entries, name } = sheet

    active_sheet_entries = sort_serialized_entries(
      serialize_sheet_entries(sheet),
    )

    if (activeEntryID !== null) {
      const entry = entries.find(({ id }) => id === activeEntryID)

      if (entry !== undefined) {
        active_entry = serialize_entry(entry, name, true)
      }
    }
  }

  const today_entries: SerializedEntry[] = []

  for (const sheet of sheets) {
    for (const entry of sheet.entries) {
      if (!is_entry_in_day(today, entry)) {
        continue
      }

      const is_active = sheet.activeEntryID === entry.id && entry.end === null

      today_entries.push(serialize_entry(entry, sheet.name, is_active))
    }
  }

  const sorted_today_entries = sort_serialized_entries(today_entries)

  return {
    dbPath: DB_PATH,
    activeSheetName,
    sheets: sheets.map((sheet) => ({
      name: sheet.name,
      activeEntryID: sheet.activeEntryID,
      entryCount: sheet.entries.length,
      isActive: sheet.name === activeSheetName,
      hasActiveEntry: sheet.activeEntryID !== null,
    })),
    activeEntry: active_entry,
    todayEntries: sorted_today_entries,
    todayTotalMs: get_serialized_entries_total_ms(sorted_today_entries),
    activeSheetEntries: active_sheet_entries,
    activeSheetTotalMs: get_serialized_entries_total_ms(active_sheet_entries),
  }
}
