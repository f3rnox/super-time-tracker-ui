import { build_csv_export } from "@/lib/build_csv_export";
import { build_json_export } from "@/lib/build_json_export";
import { build_markdown_export } from "@/lib/build_markdown_export";
import { type ExportFileFormat } from "@/lib/build_scoped_export_file_name";
import { type EntryExportFilters } from "@/lib/types/entry_export";
import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Builds export file text for the chosen format and filtered database snapshot.
 */
export function build_export_file_content(
  format: ExportFileFormat,
  scoped_db: JSONTimeTrackerDB,
  filters: EntryExportFilters,
): string {
  if (format === "json") {
    return build_json_export(scoped_db);
  }

  if (format === "csv") {
    return build_csv_export(scoped_db);
  }

  return build_markdown_export(scoped_db, filters);
}
