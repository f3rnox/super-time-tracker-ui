import { type ExportFileFormat } from "@/lib/build_scoped_export_file_name";

/**
 * Maps an export format to its file extension.
 */
export function get_export_file_extension(format: ExportFileFormat): string {
  if (format === "json") {
    return "json";
  }

  if (format === "csv") {
    return "csv";
  }

  return "md";
}
