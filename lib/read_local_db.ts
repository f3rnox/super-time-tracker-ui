import path from "node:path";
import { promises as fs } from "node:fs";

import { DB_PATH } from "@/lib/config";
import { convert_json_db } from "@/lib/convert_json_db";
import { ensure_dir_exists } from "@/lib/ensure_dir_exists";
import { gen_db } from "@/lib/gen_db";
import { migrate_json_db } from "@/lib/migrate_json_db";
import { dedupe_tracker_db_sheet_entries } from "@/lib/dedupe_tracker_db_sheet_entries";
import { reconcile_stale_active_entry_ids } from "@/lib/reconcile_stale_active_entry_ids";
import { write_local_db } from "@/lib/write_local_db";
import { type JSONTimeTrackerDB, type TimeTrackerDB } from "@/lib/types";

/**
 * Loads the tracker database from the local JSON file.
 */
export async function read_local_db(
  db_path: string = DB_PATH,
): Promise<TimeTrackerDB> {
  const db_path_dir = path.dirname(db_path);
  await ensure_dir_exists(db_path_dir);

  try {
    await fs.access(db_path);
  } catch {
    const db = gen_db();
    await write_local_db(db, db_path);
    return db;
  }

  const db_json = await fs.readFile(db_path, "utf-8");
  let json_db: JSONTimeTrackerDB;

  try {
    json_db = JSON.parse(db_json) as JSONTimeTrackerDB;
  } catch (parse_err: unknown) {
    throw new Error(`DB at ${db_path} is invalid JSON: ${String(parse_err)}`, {
      cause: parse_err,
    });
  }

  const migration_result = migrate_json_db(json_db);
  json_db = migration_result.json_db;
  const db = convert_json_db(json_db);

  const did_migrate = migration_result.did_migrate;
  const did_reconcile = reconcile_stale_active_entry_ids(db);
  const did_dedupe = dedupe_tracker_db_sheet_entries(db);

  if (did_migrate || did_reconcile || did_dedupe) {
    await write_local_db(db, db_path);
  }

  return db;
}
