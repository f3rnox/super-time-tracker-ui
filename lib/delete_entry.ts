import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface DeleteEntryArgs {
  sheet_name: string;
  entry_id: number;
}

/**
 * Deletes an entry from a sheet.
 */
export async function delete_entry(args: DeleteEntryArgs): Promise<void> {
  const { entry_id, sheet_name } = args;
  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);
  const entry_index = sheet.entries.findIndex(({ id }) => id === entry_id);

  if (entry_index === -1) {
    throw new Error(`Entry ${entry_id} not found in sheet ${sheet_name}`);
  }

  if (sheet.activeEntryID === entry_id) {
    sheet.activeEntryID = null;
  }

  sheet.entries.splice(entry_index, 1);
  await write_db(db);
}
