import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface SetEntryArchivedArgs {
  sheet_name: string;
  entry_id: number;
  archived: boolean;
}

/**
 * Archives or restores an entry without deleting its data.
 */
export async function set_entry_archived(
  args: SetEntryArchivedArgs,
): Promise<void> {
  const { archived, entry_id, sheet_name } = args;
  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry = sheet.entries.find(({ id }) => id === entry_id);

  if (entry === undefined) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  if (archived && sheet.activeEntryID === entry_id && entry.end === null) {
    throw new Error("Check out before archiving this entry");
  }

  if (archived) {
    entry.archived = true;
  } else {
    delete entry.archived;
  }

  await write_db(db);
}
