import { get_sheet } from "@/lib/get_sheet";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface RenameSheetArgs {
  sheet_name: string;
  new_name: string;
}

/**
 * Renames a sheet and updates the active sheet pointer when needed.
 */
export async function rename_sheet(args: RenameSheetArgs): Promise<void> {
  const { sheet_name } = args;
  const trimmed = args.new_name.trim();

  if (trimmed.length === 0) {
    throw new Error("Sheet name must not be empty");
  }

  if (trimmed === sheet_name) {
    return;
  }

  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);

  if (db.sheets.some(({ name }) => name === trimmed)) {
    throw new Error(`Sheet ${trimmed} already exists`);
  }

  sheet.name = trimmed;

  if (db.activeSheetName === sheet_name) {
    db.activeSheetName = trimmed;
  }

  await write_db(db);
}
