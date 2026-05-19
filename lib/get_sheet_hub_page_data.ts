import { build_sheet_hub_rows } from '@/lib/build_sheet_hub_rows'
import { read_db } from '@/lib/read_db'
import { type SheetHubRow } from '@/lib/types/sheet_hub'

export interface SheetHubPageData {
  rows: SheetHubRow[]
}

/**
 * Loads sheet hub summaries from the tracker database.
 */
export async function get_sheet_hub_page_data(): Promise<SheetHubPageData> {
  const db = await read_db()

  return {
    rows: build_sheet_hub_rows(db.sheets),
  }
}
