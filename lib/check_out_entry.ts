import { find_sheet_with_active_entry } from "@/lib/find_sheet_with_active_entry";
import { get_sheet } from "@/lib/get_sheet";
import { parse_natural_language_date } from "@/lib/parse_natural_language_date";
import { read_db } from "@/lib/read_db";
import { validate_entry_times } from "@/lib/validate_entry_times";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface CheckOutEntryArgs {
  sheet_name?: string;
  note?: string;
  at?: string;
}

/**
 * Checks out of the active entry on the requested or active sheet.
 */
export async function check_out_entry(
  args: CheckOutEntryArgs = {},
): Promise<TimeSheetEntry> {
  const { at, note, sheet_name: input_sheet_name } = args;
  const db = await read_db();
  const sheet = resolve_check_out_sheet(db, input_sheet_name);
  const { activeEntryID, name: sheet_name } = sheet;

  if (activeEntryID === null) {
    throw new Error(`No active entry for sheet ${sheet_name}`);
  }

  const entry = sheet.entries.find(({ id }) => id === activeEntryID);

  if (entry === undefined) {
    throw new Error(`No entry found with ID ${activeEntryID}`);
  }

  const end_date =
    at === undefined || at.trim().length === 0
      ? new Date()
      : parse_natural_language_date(at);

  entry.end = end_date;
  sheet.activeEntryID = null;
  validate_entry_times(entry.start, entry.end);

  if (note !== undefined && note.length > 0) {
    entry.notes.push({ timestamp: new Date(), text: note });
  }

  await write_db(db);

  return entry;
}

function resolve_check_out_sheet(
  db: Awaited<ReturnType<typeof read_db>>,
  input_sheet_name: string | undefined,
) {
  if (input_sheet_name !== undefined && input_sheet_name.length > 0) {
    return get_sheet(db, input_sheet_name);
  }

  const sheet_with_running_entry = find_sheet_with_active_entry(db);

  if (sheet_with_running_entry !== null) {
    return sheet_with_running_entry;
  }

  const active_sheet_name = db.activeSheetName;

  if (active_sheet_name === null) {
    throw new Error("No active sheet");
  }

  return get_sheet(db, active_sheet_name);
}
