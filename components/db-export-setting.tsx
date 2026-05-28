"use client";

import { useMemo, useState } from "react";

import { EntryFacetFiltersPanel } from "@/components/entry-facet-filters";
import { build_export_file_content } from "@/lib/build_export_file_content";
import {
  build_scoped_export_file_name,
  type ExportFileFormat,
} from "@/lib/build_scoped_export_file_name";
import { count_json_db_entries } from "@/lib/count_json_db_entries";
import { download_text_file } from "@/lib/download_text_file";
import { filter_json_db_for_export } from "@/lib/filter_json_db_for_export";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_date_range_ms_from_inputs } from "@/lib/get_date_range_ms_from_inputs";
import { get_empty_entry_export_filters } from "@/lib/get_empty_entry_export_filters";
import { get_export_mime_type } from "@/lib/get_export_mime_type";
import { has_entry_export_filters } from "@/lib/has_entry_export_filters";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";
import { type EntryExportFilters } from "@/lib/types/entry_export";
import { type JSONTimeTrackerDB } from "@/lib/types";

type DbExportSettingProps = Readonly<{
  db: JSONTimeTrackerDB;
  sheet_names: string[];
  tag_names: string[];
}>;

/**
 * Exports tracker data as JSON, CSV, or Markdown with optional scope filters.
 */
export function DbExportSetting({
  db,
  sheet_names,
  tag_names,
}: DbExportSettingProps) {
  const [filters, setFilters] = useState<EntryExportFilters>(() =>
    get_empty_entry_export_filters(),
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total_entry_count = useMemo(() => count_json_db_entries(db), [db]);

  const scoped_db = useMemo(
    () => filter_json_db_for_export(db, filters),
    [db, filters],
  );

  const scoped_entry_count = useMemo(
    () => count_json_db_entries(scoped_db),
    [scoped_db],
  );

  const range_is_invalid = useMemo(() => {
    const range_is_partial =
      filters.fromDate.length > 0 !== filters.toDate.length > 0;

    return (
      range_is_partial ||
      (filters.fromDate.length > 0 &&
        filters.toDate.length > 0 &&
        get_date_range_ms_from_inputs(filters.fromDate, filters.toDate) ===
          null)
    );
  }, [filters.fromDate, filters.toDate]);

  const handle_export = (format: ExportFileFormat): void => {
    setError(null);
    setStatusMessage(null);

    if (range_is_invalid) {
      setError("Choose a valid from and to date, or clear the date filter.");
      return;
    }

    if (scoped_entry_count === 0) {
      setError("No entries match the current export filters.");
      return;
    }

    try {
      const file_content = build_export_file_content(
        format,
        scoped_db,
        filters,
      );
      const file_name = build_scoped_export_file_name(format, filters);
      const mime_type = get_export_mime_type(format);

      download_text_file(file_name, file_content, mime_type);
      setStatusMessage(`Downloaded ${file_name}`);
    } catch (export_error: unknown) {
      setError(message_from_unknown_error(export_error, "Export failed"));
    }
  };

  const scope_summary = has_entry_export_filters(filters)
    ? `${scoped_entry_count} of ${total_entry_count} entries in scope`
    : `${total_entry_count} entries ready to export`;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-[0.95rem] font-semibold">Database export</h2>
        <p className="m-0 text-[0.8rem] leading-snug text-muted">
          {db.sheets.length} sheets · {scope_summary}
        </p>
      </div>

      <EntryFacetFiltersPanel
        filters={filters}
        sheet_names={sheet_names}
        tag_names={tag_names}
        on_change={setFilters}
      />

      {range_is_invalid ? (
        <p className="m-0 text-[0.82rem] text-danger">
          Choose both from and to dates, or clear the date filter.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={get_button_class_name("ghost", "small")}
          disabled={range_is_invalid || scoped_entry_count === 0}
          onClick={() => handle_export("json")}
        >
          Export JSON
        </button>
        <button
          type="button"
          className={get_button_class_name("ghost", "small")}
          disabled={range_is_invalid || scoped_entry_count === 0}
          onClick={() => handle_export("csv")}
        >
          Export CSV
        </button>
        <button
          type="button"
          className={get_button_class_name("ghost", "small")}
          disabled={range_is_invalid || scoped_entry_count === 0}
          onClick={() => handle_export("markdown")}
        >
          Export Markdown
        </button>
      </div>
      {statusMessage === null ? null : (
        <p className="m-0 text-[0.82rem] text-accent">{statusMessage}</p>
      )}
      {error === null ? null : (
        <p className="m-0 text-[0.82rem] text-danger">{error}</p>
      )}
    </div>
  );
}
