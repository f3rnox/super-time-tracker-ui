import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface CheckOutEntryArgs {
  sheet_name?: string;
  note?: string;
}

/**
 * Checks out of the active entry on the requested or active sheet.
 */
export async function check_out_entry(
  args: CheckOutEntryArgs = {},
): Promise<TimeSheetEntry> {
  const { note, sheet_name: input_sheet_name } = args;
  const db = await read_db();
  const sheet =
    input_sheet_name === undefined || input_sheet_name.length === 0
      ? get_active_sheet(db)
      : get_sheet(db, input_sheet_name);
  const { activeEntryID, name: sheet_name } = sheet;

  if (activeEntryID === null) {
    throw new Error(`No active entry for sheet ${sheet_name}`);
  }

  const entry = sheet.entries.find(({ id }) => id === activeEntryID);

  if (entry === undefined) {
    throw new Error(`No entry found with ID ${activeEntryID}`);
  }

  entry.end = new Date();
  sheet.activeEntryID = null;

  if (note !== undefined && note.length > 0) {
    entry.notes.push({ timestamp: new Date(), text: note });
  }

  await write_db(db);

  return entry;
}

function get_active_sheet(db: Awaited<ReturnType<typeof read_db>>) {
  const active_sheet_name = db.activeSheetName;

  if (active_sheet_name === null) {
    throw new Error("No active sheet");
  }

  return get_sheet(db, active_sheet_name);
}
