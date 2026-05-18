import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

/**
 * Removes a sheet and clears the active sheet when it was selected.
 */
export async function delete_sheet(sheet_name: string): Promise<void> {
  const db = await read_db();
  const sheet_index = db.sheets.findIndex(({ name }) => name === sheet_name);

  if (sheet_index === -1) {
    throw new Error(`Sheet ${sheet_name} not found`);
  }

  if (db.activeSheetName === sheet_name) {
    db.activeSheetName = null;
  }

  db.sheets.splice(sheet_index, 1);

  if (db.sheets.length === 0) {
    throw new Error("Cannot delete the last sheet");
  }

  if (db.activeSheetName === null) {
    db.activeSheetName = db.sheets[0]?.name ?? null;
  }

  await write_db(db);
}
