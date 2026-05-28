import type { SupabaseClient } from "@supabase/supabase-js";

import { DB_VERSION } from "@/lib/config";
import { create_server_supabase_client } from "@/lib/create_server_supabase_client";
import { is_missing_archived_column_error } from "@/lib/is_missing_archived_column_error";
import { dedupe_sheet_entries_by_id } from "@/lib/dedupe_sheet_entries_by_id";
import { reconcile_stale_active_entry_ids } from "@/lib/reconcile_stale_active_entry_ids";
import { supports_supabase_archive_columns } from "@/lib/supports_supabase_archive_columns";
import { gen_db, gen_sheet } from "@/lib/gen_db";
import {
  type TimeSheet,
  type TimeSheetEntry,
  type TimeSheetEntryNote,
  type TimeTrackerDB,
} from "@/lib/types";

interface TrackerAccountRow {
  active_sheet_name: string | null;
  db_version: number;
}

interface SheetRow {
  id: string;
  name: string;
  active_entry_id: number | null;
  archived?: boolean;
}

interface EntryRow {
  sheet_id: string;
  id: number;
  start_at: string;
  end_at: string | null;
  description: string;
  tags: string[];
  archived?: boolean;
}

interface EntryNoteRow {
  sheet_id: string;
  entry_id: number;
  note_index: number;
  noted_at: string;
  text: string;
}

/**
 * Loads the tracker database from Supabase for the signed-in user.
 */
export async function read_supabase_db(
  user_id: string,
): Promise<TimeTrackerDB> {
  const supabase = await create_server_supabase_client();

  const { data: account, error: account_error } = await supabase
    .from("tracker_accounts")
    .select("active_sheet_name, db_version")
    .eq("user_id", user_id)
    .maybeSingle();

  if (account_error !== null) {
    throw new Error(`Failed to load tracker account: ${account_error.message}`);
  }

  if (account === null) {
    const empty = gen_db();
    return empty;
  }

  const account_row = account as TrackerAccountRow;
  let include_archived = supports_supabase_archive_columns(
    account_row.db_version,
  );

  const sheet_load = await load_supabase_sheets(
    supabase,
    user_id,
    include_archived,
  );

  include_archived = sheet_load.include_archived;
  const sheets_list = sheet_load.sheets;

  if (sheets_list.length === 0) {
    return {
      version: account_row.db_version ?? DB_VERSION,
      activeSheetName: account_row.active_sheet_name,
      sheets: [],
    };
  }

  const sheet_ids = sheets_list.map((sheet) => sheet.id);

  const entries_list = await load_supabase_entries(
    supabase,
    sheet_ids,
    include_archived,
  );

  const { data: note_rows, error: notes_error } = await supabase
    .from("entry_notes")
    .select("sheet_id, entry_id, note_index, noted_at, text")
    .in("sheet_id", sheet_ids)
    .order("note_index", { ascending: true });

  if (notes_error !== null) {
    throw new Error(`Failed to load entry notes: ${notes_error.message}`);
  }

  const notes_list = (note_rows ?? []) as EntryNoteRow[];

  const notes_by_entry = new Map<string, TimeSheetEntryNote[]>();

  for (const note of notes_list) {
    const key = `${note.sheet_id}:${note.entry_id}`;
    const existing = notes_by_entry.get(key) ?? [];

    existing.push({
      text: note.text,
      timestamp: new Date(note.noted_at),
    });
    notes_by_entry.set(key, existing);
  }

  const entries_by_sheet = new Map<string, TimeSheetEntry[]>();

  for (const entry of entries_list) {
    const key = `${entry.sheet_id}:${entry.id}`;
    const sheet_entries = entries_by_sheet.get(entry.sheet_id) ?? [];

    sheet_entries.push({
      id: entry.id,
      description: entry.description,
      tags: entry.tags ?? [],
      start: new Date(entry.start_at),
      end: entry.end_at === null ? null : new Date(entry.end_at),
      notes: notes_by_entry.get(key) ?? [],
      ...(entry.archived === true ? { archived: true } : {}),
    });
    entries_by_sheet.set(entry.sheet_id, sheet_entries);
  }

  const sheets: TimeSheet[] = sheets_list.map((sheet) => {
    const created = gen_sheet(
      sheet.name,
      dedupe_sheet_entries_by_id(entries_by_sheet.get(sheet.id) ?? []),
      sheet.active_entry_id,
    );

    if (sheet.archived === true) {
      created.archived = true;
    }

    return created;
  });

  const db: TimeTrackerDB = {
    version: include_archived
      ? (account_row.db_version ?? DB_VERSION)
      : Math.min(account_row.db_version ?? DB_VERSION, 3),
    activeSheetName: account_row.active_sheet_name,
    sheets,
  };

  reconcile_stale_active_entry_ids(db);

  return db;
}

async function load_supabase_sheets(
  supabase: SupabaseClient,
  user_id: string,
  include_archived: boolean,
): Promise<{ include_archived: boolean; sheets: SheetRow[] }> {
  if (include_archived) {
    const { data, error } = await supabase
      .from("sheets")
      .select("id, name, active_entry_id, archived")
      .eq("user_id", user_id)
      .order("name", { ascending: true });

    if (error !== null && is_missing_archived_column_error(error.message)) {
      await supabase
        .from("tracker_accounts")
        .update({ db_version: 3 })
        .eq("user_id", user_id);

      return load_supabase_sheets(supabase, user_id, false);
    }

    if (error !== null) {
      throw new Error(`Failed to load sheets: ${error.message}`);
    }

    return { include_archived: true, sheets: (data ?? []) as SheetRow[] };
  }

  const { data, error } = await supabase
    .from("sheets")
    .select("id, name, active_entry_id")
    .eq("user_id", user_id)
    .order("name", { ascending: true });

  if (error !== null) {
    throw new Error(`Failed to load sheets: ${error.message}`);
  }

  return { include_archived: false, sheets: (data ?? []) as SheetRow[] };
}

async function load_supabase_entries(
  supabase: SupabaseClient,
  sheet_ids: string[],
  include_archived: boolean,
): Promise<EntryRow[]> {
  if (include_archived) {
    const { data, error } = await supabase
      .from("entries")
      .select("sheet_id, id, start_at, end_at, description, tags, archived")
      .in("sheet_id", sheet_ids)
      .order("id", { ascending: true });

    if (error !== null) {
      throw new Error(`Failed to load entries: ${error.message}`);
    }

    return (data ?? []) as EntryRow[];
  }

  const { data, error } = await supabase
    .from("entries")
    .select("sheet_id, id, start_at, end_at, description, tags")
    .in("sheet_id", sheet_ids)
    .order("id", { ascending: true });

  if (error !== null) {
    throw new Error(`Failed to load entries: ${error.message}`);
  }

  return (data ?? []) as EntryRow[];
}
