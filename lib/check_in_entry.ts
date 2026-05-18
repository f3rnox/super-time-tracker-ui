import { parse_entry_from_input } from "@/lib/parse_entry_from_input";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";
import { gen_sheet } from "@/lib/gen_db";
import { get_sheet } from "@/lib/get_sheet";
import { type TimeSheetEntry, type TimeTrackerDB } from "@/lib/types";

export interface CheckInEntryArgs {
  description: string;
  sheet_name?: string;
  note?: string;
}

/**
 * Starts a new active entry on the requested or active sheet.
 */
export async function check_in_entry(
  args: CheckInEntryArgs,
): Promise<TimeSheetEntry> {
  const { description, note, sheet_name: input_sheet_name } = args;
  const db = await read_db();
  const active_sheet_name = db.activeSheetName;
  const sheet_name =
    input_sheet_name === undefined || input_sheet_name.length === 0
      ? active_sheet_name
      : input_sheet_name;

  if (sheet_name === null) {
    throw new Error("No active sheet");
  }

  const sheet_exists = db.sheets.some(({ name }) => name === sheet_name);
  const sheet = sheet_exists
    ? get_sheet(db, sheet_name)
    : add_sheet_to_db(db, sheet_name);

  if (sheet.activeEntryID !== null) {
    const entry = sheet.entries.find(({ id }) => id === sheet.activeEntryID);

    if (entry !== undefined) {
      throw new Error(
        `An entry is already active (${entry.id}): ${entry.description}`,
      );
    }
  }

  const id = sheet.entries.length;
  const parsed = parse_entry_from_input(id, description);
  const entry: TimeSheetEntry = {
    ...parsed,
    description:
      parsed.description.length > 0 ? parsed.description : description.trim(),
  };

  if (note !== undefined && note.length > 0) {
    entry.notes.push({ timestamp: new Date(), text: note });
  }

  sheet.entries.push(entry);
  sheet.activeEntryID = id;
  db.activeSheetName = sheet.name;

  await write_db(db);

  return entry;
}

function add_sheet_to_db(db: TimeTrackerDB, sheet_name: string) {
  const sheet = gen_sheet(sheet_name);
  db.sheets.push(sheet);
  return sheet;
}
