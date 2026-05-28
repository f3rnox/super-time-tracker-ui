import { type EntryExportFilters } from "@/lib/types/entry_export";

/**
 * Returns default empty entry export filters.
 */
export function get_empty_entry_export_filters(): EntryExportFilters {
  return {
    sheetName: "",
    tag: "",
    fromDate: "",
    toDate: "",
  };
}
