import { convert_db_to_json } from "@/lib/convert_db_to_json";
import { read_db } from "@/lib/read_db";

/**
 * Reads the tracker database JSON used for backup downloads.
 */
export async function read_db_backup_contents(): Promise<string> {
  const db = await read_db();
  const json_db = convert_db_to_json(db);

  return JSON.stringify(json_db, null, 2);
}
