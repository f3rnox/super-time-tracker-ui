import { DB_VERSION } from '@/lib/config'
import { gen_sheet } from '@/lib/gen_db'
import {
  pick_merged_time_tracker_entry,
  type MergePreference,
} from '@/lib/pick_merged_time_tracker_entry'
import {
  type TimeSheet,
  type TimeSheetEntry,
  type TimeTrackerDB,
} from '@/lib/types'

/**
 * Merges two tracker databases, unioning sheets and reconciling duplicate entries.
 */
export function merge_time_tracker_dbs(
  base: TimeTrackerDB,
  incoming: TimeTrackerDB,
  prefer: MergePreference = 'incoming',
): TimeTrackerDB {
  const sheet_names = new Set<string>()

  for (const sheet of base.sheets) {
    sheet_names.add(sheet.name)
  }

  for (const sheet of incoming.sheets) {
    sheet_names.add(sheet.name)
  }

  const sheets: TimeSheet[] = [...sheet_names].map((name) => {
    const base_sheet = base.sheets.find((sheet) => sheet.name === name)
    const incoming_sheet = incoming.sheets.find((sheet) => sheet.name === name)

    if (base_sheet === undefined && incoming_sheet === undefined) {
      return gen_sheet(name)
    }

    if (base_sheet === undefined) {
      return incoming_sheet!
    }

    if (incoming_sheet === undefined) {
      return base_sheet
    }

    const entry_ids = new Set<number>()

    for (const entry of base_sheet.entries) {
      entry_ids.add(entry.id)
    }

    for (const entry of incoming_sheet.entries) {
      entry_ids.add(entry.id)
    }

    const entries: TimeSheetEntry[] = [...entry_ids]
      .sort((left, right) => left - right)
      .map((id) => {
        const base_entry = base_sheet.entries.find((entry) => entry.id === id)
        const incoming_entry = incoming_sheet.entries.find((entry) => entry.id === id)

        if (base_entry === undefined) {
          return incoming_entry!
        }

        if (incoming_entry === undefined) {
          return base_entry
        }

        return pick_merged_time_tracker_entry(base_entry, incoming_entry, prefer)
      })

    const active_entry_id = pick_merged_active_entry_id(
      base_sheet.activeEntryID,
      incoming_sheet.activeEntryID,
      entries,
      prefer,
    )

    return {
      name,
      entries,
      activeEntryID: active_entry_id,
    }
  })

  sheets.sort((left, right) => left.name.localeCompare(right.name))

  const active_sheet_name = pick_merged_active_sheet_name(
    base.activeSheetName,
    incoming.activeSheetName,
    sheets,
    prefer,
  )

  return {
    version: Math.max(base.version, incoming.version, DB_VERSION),
    sheets,
    activeSheetName: active_sheet_name,
  }
}

function pick_merged_active_entry_id(
  base_active_id: number | null,
  incoming_active_id: number | null,
  entries: TimeSheetEntry[],
  prefer: MergePreference,
): number | null {
  const base_entry =
    base_active_id === null
      ? null
      : entries.find((entry) => entry.id === base_active_id) ?? null
  const incoming_entry =
    incoming_active_id === null
      ? null
      : entries.find((entry) => entry.id === incoming_active_id) ?? null

  if (base_entry === null && incoming_entry === null) {
    return null
  }

  if (base_entry === null) {
    return incoming_entry!.id
  }

  if (incoming_entry === null) {
    return base_entry.id
  }

  if (base_entry.end === null && incoming_entry.end !== null) {
    return base_entry.id
  }

  if (incoming_entry.end === null && base_entry.end !== null) {
    return incoming_entry.id
  }

  if (base_entry.end === null && incoming_entry.end === null) {
    if (base_entry.start.getTime() === incoming_entry.start.getTime()) {
      return prefer === 'incoming' ? incoming_entry.id : base_entry.id
    }

    return base_entry.start.getTime() > incoming_entry.start.getTime()
      ? base_entry.id
      : incoming_entry.id
  }

  const base_end = base_entry.end!.getTime()
  const incoming_end = incoming_entry.end!.getTime()

  if (base_end === incoming_end) {
    return prefer === 'incoming' ? incoming_entry.id : base_entry.id
  }

  return base_end > incoming_end ? base_entry.id : incoming_entry.id
}

function pick_merged_active_sheet_name(
  base_active_sheet: string | null,
  incoming_active_sheet: string | null,
  sheets: TimeSheet[],
  prefer: MergePreference,
): string | null {
  const sheet_names = new Set(sheets.map((sheet) => sheet.name))

  const base_valid =
    base_active_sheet !== null && sheet_names.has(base_active_sheet)
  const incoming_valid =
    incoming_active_sheet !== null && sheet_names.has(incoming_active_sheet)

  if (base_valid && incoming_valid) {
    const base_running = sheets.find((sheet) => sheet.name === base_active_sheet)
    const incoming_running = sheets.find(
      (sheet) => sheet.name === incoming_active_sheet,
    )

    if (
      base_running?.activeEntryID !== null &&
      incoming_running?.activeEntryID === null
    ) {
      return base_active_sheet
    }

    if (
      incoming_running?.activeEntryID !== null &&
      base_running?.activeEntryID === null
    ) {
      return incoming_active_sheet
    }

    return prefer === 'incoming' ? incoming_active_sheet : base_active_sheet
  }

  if (incoming_valid) {
    return incoming_active_sheet
  }

  if (base_valid) {
    return base_active_sheet
  }

  const running_sheet = sheets.find((sheet) => sheet.activeEntryID !== null)

  return running_sheet?.name ?? sheets[0]?.name ?? null
}
