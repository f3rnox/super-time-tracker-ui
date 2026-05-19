import { DB_VERSION } from '@/lib/config'
import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { gen_db, gen_sheet } from '@/lib/gen_db'
import {
  type TimeSheet,
  type TimeSheetEntry,
  type TimeSheetEntryNote,
  type TimeTrackerDB,
} from '@/lib/types'

interface TrackerAccountRow {
  active_sheet_name: string | null
  db_version: number
}

interface SheetRow {
  id: string
  name: string
  active_entry_id: number | null
}

interface EntryRow {
  sheet_id: string
  id: number
  start_at: string
  end_at: string | null
  description: string
  tags: string[]
}

interface EntryNoteRow {
  sheet_id: string
  entry_id: number
  note_index: number
  noted_at: string
  text: string
}

/**
 * Loads the tracker database from Supabase for the signed-in user.
 */
export async function read_supabase_db(user_id: string): Promise<TimeTrackerDB> {
  const supabase = await create_server_supabase_client()

  const { data: account, error: account_error } = await supabase
    .from('tracker_accounts')
    .select('active_sheet_name, db_version')
    .eq('user_id', user_id)
    .maybeSingle()

  if (account_error !== null) {
    throw new Error(`Failed to load tracker account: ${account_error.message}`)
  }

  if (account === null) {
    const empty = gen_db()
    return empty
  }

  const account_row = account as TrackerAccountRow

  const { data: sheet_rows, error: sheets_error } = await supabase
    .from('sheets')
    .select('id, name, active_entry_id')
    .eq('user_id', user_id)
    .order('name', { ascending: true })

  if (sheets_error !== null) {
    throw new Error(`Failed to load sheets: ${sheets_error.message}`)
  }

  const sheets_list = (sheet_rows ?? []) as SheetRow[]

  if (sheets_list.length === 0) {
    return {
      version: account_row.db_version ?? DB_VERSION,
      activeSheetName: account_row.active_sheet_name,
      sheets: [],
    }
  }

  const sheet_ids = sheets_list.map((sheet) => sheet.id)

  const { data: entry_rows, error: entries_error } = await supabase
    .from('entries')
    .select('sheet_id, id, start_at, end_at, description, tags')
    .in('sheet_id', sheet_ids)
    .order('id', { ascending: true })

  if (entries_error !== null) {
    throw new Error(`Failed to load entries: ${entries_error.message}`)
  }

  const entries_list = (entry_rows ?? []) as EntryRow[]

  const { data: note_rows, error: notes_error } = await supabase
    .from('entry_notes')
    .select('sheet_id, entry_id, note_index, noted_at, text')
    .in('sheet_id', sheet_ids)
    .order('note_index', { ascending: true })

  if (notes_error !== null) {
    throw new Error(`Failed to load entry notes: ${notes_error.message}`)
  }

  const notes_list = (note_rows ?? []) as EntryNoteRow[]

  const notes_by_entry = new Map<string, TimeSheetEntryNote[]>()

  for (const note of notes_list) {
    const key = `${note.sheet_id}:${note.entry_id}`
    const existing = notes_by_entry.get(key) ?? []

    existing.push({
      text: note.text,
      timestamp: new Date(note.noted_at),
    })
    notes_by_entry.set(key, existing)
  }

  const entries_by_sheet = new Map<string, TimeSheetEntry[]>()

  for (const entry of entries_list) {
    const key = `${entry.sheet_id}:${entry.id}`
    const sheet_entries = entries_by_sheet.get(entry.sheet_id) ?? []

    sheet_entries.push({
      id: entry.id,
      description: entry.description,
      tags: entry.tags ?? [],
      start: new Date(entry.start_at),
      end: entry.end_at === null ? null : new Date(entry.end_at),
      notes: notes_by_entry.get(key) ?? [],
    })
    entries_by_sheet.set(entry.sheet_id, sheet_entries)
  }

  const sheets: TimeSheet[] = sheets_list.map((sheet) =>
    gen_sheet(
      sheet.name,
      entries_by_sheet.get(sheet.id) ?? [],
      sheet.active_entry_id,
    ),
  )

  return {
    version: account_row.db_version ?? DB_VERSION,
    activeSheetName: account_row.active_sheet_name,
    sheets,
  }
}
