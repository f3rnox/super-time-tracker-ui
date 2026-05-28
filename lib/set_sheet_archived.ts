import { get_sheet } from "@/lib/get_sheet";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface SetSheetArchivedArgs {
  sheet_name: string;
  archived: boolean;
}

/**
 * Archives or restores a sheet without deleting its data.
 */
export async function set_sheet_archived(
  args: SetSheetArchivedArgs,
): Promise<void> {
  const { archived, sheet_name } = args;
  const db = await read_db();
  const sheet = get_sheet(db, sheet_name);

  if (archived) {
    if (sheet.activeEntryID !== null) {
      throw new Error("Stop the active timer before archiving this sheet");
    }

    const visible_count = db.sheets.filter(
      (candidate) => !is_sheet_archived(candidate),
    ).length;

    if (visible_count <= 1 && !is_sheet_archived(sheet)) {
      throw new Error("Cannot archive the last visible sheet");
    }
  }

  if (archived) {
    sheet.archived = true;
  } else {
    delete sheet.archived;
  }

  if (archived && db.activeSheetName === sheet_name) {
    const next_visible = db.sheets.find(
      (candidate) =>
        candidate.name !== sheet_name && !is_sheet_archived(candidate),
    );
    db.activeSheetName = next_visible?.name ?? null;
  }

  await write_db(db);
}
