import { type JSONTimeTrackerDB, type TimeTrackerDB } from "@/lib/types";

/**
 * Converts a JSON-serialized DB into in-memory Date instances.
 */
export function convert_json_db(json_db: JSONTimeTrackerDB): TimeTrackerDB {
  const {
    sheets: json_sheets,
    version: json_version,
    activeSheetName: json_active_sheet_name,
  } = json_db;

  const sheets = json_sheets.map(
    ({
      name: json_name,
      entries: json_entries,
      activeEntryID: json_active_entry_id,
      archived: json_archived,
    }) => ({
      name: json_name,
      activeEntryID: json_active_entry_id,
      ...(json_archived === true ? { archived: true } : {}),
      entries: json_entries.map(
        ({
          id: json_id,
          start: json_start,
          end: json_end,
          description: json_description,
          tags: json_tags,
          notes: json_notes,
          archived: json_entry_archived,
        }) => ({
          id: json_id,
          description: json_description,
          tags: json_tags,
          notes: json_notes.map(({ timestamp, text }) => ({
            text,
            timestamp: new Date(timestamp),
          })),
          start: new Date(json_start),
          end: json_end === null ? null : new Date(json_end),
          ...(json_entry_archived === true ? { archived: true } : {}),
        }),
      ),
    }),
  );

  return {
    version: json_version,
    activeSheetName: json_active_sheet_name,
    sheets,
  };
}
