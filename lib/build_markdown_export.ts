import { has_entry_export_filters } from "@/lib/has_entry_export_filters";
import { type EntryExportFilters } from "@/lib/types/entry_export";
import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Builds a Markdown export of tracker entries.
 */
export function build_markdown_export(
  db: JSONTimeTrackerDB,
  filters: EntryExportFilters = {
    sheetName: "",
    tag: "",
    fromDate: "",
    toDate: "",
  },
): string {
  const lines: string[] = [];
  const exported_at = new Date().toISOString();
  const total_entries = db.sheets.reduce(
    (total, sheet) => total + sheet.entries.length,
    0,
  );

  lines.push("# super-time-tracker export");
  lines.push("");
  lines.push(`- Exported at: ${exported_at}`);
  lines.push(`- Active sheet: ${db.activeSheetName ?? "none"}`);
  lines.push(`- Sheets: ${db.sheets.length}`);
  lines.push(`- Entries: ${total_entries}`);

  if (has_entry_export_filters(filters)) {
    lines.push(`- Scope: ${describe_export_scope(filters)}`);
  }

  lines.push("");

  for (const sheet of db.sheets) {
    lines.push(`## ${sheet.name}`);
    lines.push("");
    lines.push(`- Active entry ID: ${sheet.activeEntryID ?? "none"}`);
    lines.push(`- Entries: ${sheet.entries.length}`);
    lines.push("");

    if (sheet.entries.length === 0) {
      lines.push("_No entries_");
      lines.push("");
      continue;
    }

    lines.push("| ID | Description | Tags | Start | End | Duration | Notes |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");

    for (const entry of sheet.entries) {
      const start = new Date(entry.start).toISOString();
      const end =
        entry.end === null ? "running" : new Date(entry.end).toISOString();
      const duration =
        entry.end === null
          ? "running"
          : `${Math.max(0, entry.end - entry.start) / 60000} min`;
      const tags =
        entry.tags.length === 0
          ? "-"
          : entry.tags.map((tag) => `@${tag}`).join(" ");
      const notes =
        entry.notes.length === 0
          ? "-"
          : entry.notes.map((note) => note.text).join(" / ");

      lines.push(
        `| ${entry.id} | ${escape_markdown_cell(entry.description)} | ${escape_markdown_cell(tags)} | ${start} | ${end} | ${duration} | ${escape_markdown_cell(notes)} |`,
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

function describe_export_scope(filters: EntryExportFilters): string {
  const parts: string[] = [];

  if (filters.sheetName.trim().length > 0) {
    parts.push(`sheet "${filters.sheetName.trim()}"`);
  }

  if (filters.tag.trim().length > 0) {
    parts.push(`tag @${filters.tag.trim()}`);
  }

  if (filters.fromDate.trim().length > 0 || filters.toDate.trim().length > 0) {
    parts.push(
      `dates ${filters.fromDate.trim() || "…"} – ${filters.toDate.trim() || "…"}`,
    );
  }

  return parts.join(", ");
}

function escape_markdown_cell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}
