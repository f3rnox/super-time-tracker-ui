import { get_next_entry_id } from "@/lib/get_next_entry_id";
import { get_sheet } from "@/lib/get_sheet";
import { parse_natural_language_date } from "@/lib/parse_natural_language_date";
import { read_db } from "@/lib/read_db";
import { validate_entry_times } from "@/lib/validate_entry_times";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface SplitEntryArgs {
  sheet_name: string;
  entry_id: number;
  at: string;
}

export interface SplitEntryResult {
  first: TimeSheetEntry;
  second: TimeSheetEntry;
}

/**
 * Splits a completed entry into two at the given time.
 */
export async function split_entry(
  args: SplitEntryArgs,
): Promise<SplitEntryResult> {
  const { at, entry_id, sheet_name } = args;
  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry = sheet.entries.find((candidate) => candidate.id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  if (sheet.activeEntryID === entry_id) {
    throw new Error("Cannot split the active entry");
  }

  if (entry.end === null) {
    throw new Error("Cannot split an entry without an end time");
  }

  const split_at = parse_natural_language_date(at);
  const start_ms = entry.start.getTime();
  const end_ms = entry.end.getTime();
  const split_ms = split_at.getTime();

  if (split_ms <= start_ms || split_ms >= end_ms) {
    throw new Error("Split time must be after the start and before the end");
  }

  const first_notes = entry.notes.filter((note) => +note.timestamp < split_ms);
  const second_notes = entry.notes.filter(
    (note) => +note.timestamp >= split_ms,
  );
  const original_end = entry.end;

  entry.end = split_at;
  entry.notes = first_notes;
  validate_entry_times(entry.start, entry.end);

  const second_entry: TimeSheetEntry = {
    id: get_next_entry_id(sheet),
    description: entry.description,
    tags: [...entry.tags],
    start: split_at,
    end: original_end,
    notes: second_notes,
  };

  validate_entry_times(second_entry.start, second_entry.end);
  sheet.entries.push(second_entry);

  await write_db(db);

  return { first: entry, second: second_entry };
}
