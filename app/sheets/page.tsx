import { SheetHubView } from "@/components/sheet-hub-view";
import { get_sheet_hub_page_data } from "@/lib/get_sheet_hub_page_data";

/**
 * Sheet hub route — per-sheet week/month summaries.
 */
export default async function SheetsPage() {
  const { archived_rows, rows } = await get_sheet_hub_page_data();

  return <SheetHubView archived_rows={archived_rows} rows={rows} />;
}
