import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Adds empty tag and note arrays to each entry for DB version 2.
 */
export function migrate_json_db_to_version_two(
  json_db: JSONTimeTrackerDB,
): JSONTimeTrackerDB {
  const {
    sheets: json_sheets,
    version: json_version,
    activeSheetName: json_active_sheet_name,
  } = json_db;

  if (json_version !== 1 && json_version !== undefined) {
    throw new Error(
      `DB is version ${json_version}, cannot migrate to version 2.`,
    );
  }

  return {
    version: 2,
    activeSheetName: json_active_sheet_name,
    sheets: json_sheets.map(
      ({
        name: json_name,
        entries: json_entries,
        activeEntryID: json_active_entry_id,
      }) => ({
        name: json_name,
        activeEntryID: json_active_entry_id,
        entries: json_entries.map(
          ({
            id: json_id,
            start: json_start,
            end: json_end,
            description: json_description,
          }) => ({
            tags: [],
            notes: [],
            id: json_id,
            end: json_end,
            start: json_start,
            description: json_description,
          }),
        ),
      }),
    ),
  };
}
