import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Bumps the JSON DB to version 4; archive flags are optional on load.
 */
export function migrate_json_db_to_version_four(
  json_db: JSONTimeTrackerDB,
): JSONTimeTrackerDB {
  const { version: json_version, activeSheetName, sheets } = json_db;

  if (json_version !== 3) {
    throw new Error(
      `DB is version ${json_version}, cannot migrate to version 4.`,
    );
  }

  return {
    version: 4,
    activeSheetName,
    sheets,
  };
}
