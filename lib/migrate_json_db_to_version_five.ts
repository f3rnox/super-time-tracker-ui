import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Adds sheet-scoped tasks and bumps the JSON DB to version 5.
 */
export function migrate_json_db_to_version_five(
  json_db: JSONTimeTrackerDB,
): JSONTimeTrackerDB {
  const { version: json_version, activeSheetName, sheets } = json_db;

  if (json_version !== 4) {
    throw new Error(
      `DB is version ${json_version}, cannot migrate to version 5.`,
    );
  }

  return {
    version: 5,
    activeSheetName,
    sheets: sheets.map((sheet) => ({
      ...sheet,
      tasks: sheet.tasks ?? [],
    })),
  };
}
