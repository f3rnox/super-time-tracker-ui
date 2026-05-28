import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Builds a CSV export of tracker entries.
 */
export function build_csv_export(db: JSONTimeTrackerDB): string {
  const header = [
    "sheet_name",
    "entry_id",
    "description",
    "tags",
    "start_iso",
    "end_iso",
    "duration_minutes",
    "note_count",
    "notes",
  ];
  const rows = db.sheets.flatMap((sheet) => {
    return sheet.entries.map((entry) => {
      const start_iso = new Date(entry.start).toISOString();
      const end_iso =
        entry.end === null ? "" : new Date(entry.end).toISOString();
      const duration_minutes =
        entry.end === null
          ? ""
          : String(Math.max(0, entry.end - entry.start) / 60000);
      const notes = entry.notes.map((note) => note.text).join(" | ");

      return [
        sheet.name,
        String(entry.id),
        entry.description,
        entry.tags.join(" "),
        start_iso,
        end_iso,
        duration_minutes,
        String(entry.notes.length),
        notes,
      ]
        .map(escape_csv_cell)
        .join(",");
    });
  });

  return [header.join(","), ...rows].join("\n");
}

function escape_csv_cell(value: string): string {
  const normalized = value.replaceAll('"', '""');
  return `"${normalized}"`;
}
