import { get_sheet } from "@/lib/get_sheet";
import { has_string_value } from "@/lib/has_string_value";
import { parse_natural_language_date } from "@/lib/parse_natural_language_date";
import { read_db } from "@/lib/read_db";
import { validate_entry_times } from "@/lib/validate_entry_times";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface EditEntryArgs {
  sheet_name: string;
  entry_id: number;
  start?: string;
  end?: string;
  description?: string;
}

/**
 * Updates an entry's description and/or start and end times.
 */
export async function edit_entry(args: EditEntryArgs): Promise<TimeSheetEntry> {
  const { description, end, entry_id, sheet_name, start } = args;
  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry = sheet.entries.find(({ id }) => id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  let did_update = false;

  if (has_string_value(description)) {
    entry.description = description.trim();
    did_update = true;
  }

  if (has_string_value(start)) {
    entry.start = parse_natural_language_date(start);
    did_update = true;
  }

  if (has_string_value(end)) {
    entry.end = parse_natural_language_date(end);
    did_update = true;
  }

  if (!did_update) {
    throw new Error("No changes provided");
  }

  validate_entry_times(entry.start, entry.end);

  await write_db(db);

  return entry;
}
