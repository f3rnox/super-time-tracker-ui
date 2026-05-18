import { DB_VERSION } from "@/lib/config";
import { migrate_json_db_to_version_three } from "@/lib/migrate_json_db_to_version_three";
import { migrate_json_db_to_version_two } from "@/lib/migrate_json_db_to_version_two";
import { type JSONTimeTrackerDB } from "@/lib/types";

const MIGRATIONS_BY_TARGET_VERSION: Record<
  number,
  (json_db: JSONTimeTrackerDB) => JSONTimeTrackerDB
> = {
  2: migrate_json_db_to_version_two,
  3: migrate_json_db_to_version_three,
};

export interface MigrateJsonDbResult {
  did_migrate: boolean;
  json_db: JSONTimeTrackerDB;
}

/**
 * Runs sequential migrations until the JSON DB reaches the current version.
 */
export function migrate_json_db(
  json_db_input: JSONTimeTrackerDB,
): MigrateJsonDbResult {
  let json_db = json_db_input;
  let did_migrate = false;
  let current_version = json_db.version === undefined ? 1 : json_db.version;

  if (current_version > DB_VERSION || current_version < 1) {
    throw new Error(`Unknown DB version ${json_db.version}, cannot load.`);
  }

  while (current_version < DB_VERSION) {
    const target_version = current_version + 1;
    const migration = MIGRATIONS_BY_TARGET_VERSION[target_version];

    if (migration === undefined) {
      throw new Error(
        `Missing migration from version ${current_version} to ${target_version}.`,
      );
    }

    json_db = migration(json_db);

    if (json_db.version !== target_version) {
      throw new Error(
        `Invalid migration output for version ${target_version}.`,
      );
    }

    current_version = target_version;
    did_migrate = true;
  }

  return { json_db, did_migrate };
}
