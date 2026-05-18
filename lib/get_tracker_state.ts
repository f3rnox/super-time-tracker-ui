import { collect_known_tags } from '@/lib/collect_known_tags'
import { DB_PATH } from '@/lib/config'
import { get_sheet } from '@/lib/get_sheet'
import { get_serialized_entries_total_ms } from '@/lib/get_serialized_entries_total_ms'
import { read_db } from '@/lib/read_db'
import { resolve_active_sheet_name } from '@/lib/resolve_active_sheet_name'
import { find_all_serialized_active_entries } from '@/lib/find_all_serialized_active_entries'
import { find_serialized_active_entry_for_sheet } from '@/lib/find_serialized_active_entry_for_sheet'
import { serialize_sheet_entries } from '@/lib/serialize_sheet_entries'
import { set_active_sheet } from '@/lib/set_active_sheet'
import { sort_serialized_entries } from '@/lib/sort_serialized_entries'
import {
  type SerializedEntry,
  type TrackerState,
} from '@/lib/types/tracker_state'

/**
 * Builds the tracker snapshot consumed by the web UI.
 */
export async function get_tracker_state(
  preferred_sheet_name?: string | null,
): Promise<TrackerState> {
  const db = await read_db()
  const resolved_sheet_name = resolve_active_sheet_name(db, preferred_sheet_name)

  if (db.activeSheetName !== resolved_sheet_name) {
    await set_active_sheet(resolved_sheet_name)
    db.activeSheetName = resolved_sheet_name
  }

  const { activeSheetName, sheets } = db

  let active_sheet_entries: SerializedEntry[] = []

  if (activeSheetName !== null) {
    const sheet = get_sheet(db, activeSheetName)

    active_sheet_entries = sort_serialized_entries(
      serialize_sheet_entries(sheet),
      'newest',
    )
  }

  const active_sheet_entry =
    activeSheetName !== null
      ? find_serialized_active_entry_for_sheet(db, activeSheetName)
      : null
  const running_entries = find_all_serialized_active_entries(db)
  const running_entry = active_sheet_entry ?? running_entries[0] ?? null

  return {
    dbPath: DB_PATH,
    activeSheetName,
    knownTags: collect_known_tags(db),
    sheets: sheets.map((sheet) => ({
      name: sheet.name,
      activeEntryID: sheet.activeEntryID,
      entryCount: sheet.entries.length,
      isActive: sheet.name === activeSheetName,
      hasActiveEntry: sheet.activeEntryID !== null,
    })),
    activeEntry: active_sheet_entry,
    runningEntry: running_entry,
    runningEntries: running_entries,
    activeSheetEntries: active_sheet_entries,
    activeSheetTotalMs: get_serialized_entries_total_ms(active_sheet_entries),
  }
}
