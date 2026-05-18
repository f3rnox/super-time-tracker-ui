import { promises as fs } from "node:fs";

import { DB_PATH } from "@/lib/config";
import { type TimeTrackerDB } from "@/lib/types";

/**
 * Persists the in-memory database to disk as JSON.
 */
export async function write_db(
  db: TimeTrackerDB,
  db_path: string = DB_PATH,
): Promise<void> {
  const db_json = JSON.stringify(db);

  try {
    await fs.writeFile(db_path, db_json);
  } catch (err: unknown) {
    throw new Error(`Failed to save DB: ${String(err)}`, { cause: err });
  }
}
