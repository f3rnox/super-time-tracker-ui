import { build_sheet_hub_rows } from "@/lib/build_sheet_hub_rows";
import { filter_visible_sheets } from "@/lib/filter_visible_sheets";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { read_db } from "@/lib/read_db";
import { type SheetHubRow } from "@/lib/types/sheet_hub";

export interface SheetHubPageData {
  rows: SheetHubRow[];
  archived_rows: SheetHubRow[];
}

/**
 * Loads sheet hub summaries from the tracker database.
 */
export async function get_sheet_hub_page_data(): Promise<SheetHubPageData> {
  const db = await read_db();
  const visible_sheets = filter_visible_sheets(db.sheets);
  const archived_sheets = db.sheets.filter((sheet) => is_sheet_archived(sheet));

  return {
    rows: build_sheet_hub_rows(visible_sheets),
    archived_rows: build_sheet_hub_rows(archived_sheets),
  };
}
