import { get_next_entry_id } from "@/lib/get_next_entry_id";
import { get_sheet } from "@/lib/get_sheet";
import { parse_entry_from_input } from "@/lib/parse_entry_from_input";
import { parse_natural_language_date } from "@/lib/parse_natural_language_date";
import { read_db } from "@/lib/read_db";
import { validate_entry_times } from "@/lib/validate_entry_times";
import { write_db } from "@/lib/write_db";
import { type TimeSheetEntry } from "@/lib/types";

export interface CreateCompletedEntryArgs {
  sheet_name: string;
  description: string;
  start: string;
  end: string;
  note?: string;
}

/**
 * Adds a completed historical entry without changing the sheet's active timer.
 */
export async function create_completed_entry(
  args: CreateCompletedEntryArgs,
): Promise<TimeSheetEntry> {
  const db = await read_db();
  const sheet_name = args.sheet_name.trim();
  const description = args.description.trim();

  if (sheet_name.length === 0) {
    throw new Error("Sheet name is required");
  }

  if (description.length === 0) {
    throw new Error("Description is required");
  }

  const sheet = get_sheet(db, sheet_name);
  const start = parse_natural_language_date(args.start);
  const end = parse_natural_language_date(args.end);
  const id = get_next_entry_id(sheet);
  const parsed = parse_entry_from_input(id, description, start, end);
  const entry: TimeSheetEntry = {
    ...parsed,
    description:
      parsed.description.length > 0 ? parsed.description : description,
  };
  const note = args.note?.trim() ?? "";

  validate_entry_times(entry.start, entry.end);

  if (note.length > 0) {
    entry.notes.push({ timestamp: new Date(), text: note });
  }

  sheet.entries.push(entry);

  await write_db(db);

  return entry;
}
