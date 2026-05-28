import { collect_known_tags } from "@/lib/collect_known_tags";
import { filter_visible_sheets } from "@/lib/filter_visible_sheets";
import { read_db } from "@/lib/read_db";

export interface TemplateLibraryPageData {
  sheetNames: string[];
  knownTags: string[];
}

/**
 * Loads server-owned data needed by the client-side template library.
 */
export async function get_template_library_page_data(): Promise<TemplateLibraryPageData> {
  const db = await read_db();

  return {
    sheetNames: filter_visible_sheets(db.sheets).map((sheet) => sheet.name),
    knownTags: collect_known_tags(db),
  };
}
