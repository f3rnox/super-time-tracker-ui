import { convert_json_db } from '@/lib/convert_json_db'
import { is_json_time_tracker_db } from '@/lib/is_json_time_tracker_db'
import { migrate_json_db } from '@/lib/migrate_json_db'
import { write_db } from '@/lib/write_db'

/**
 * Replaces the on-disk database with an uploaded backup after validation.
 */
export async function restore_db_from_uploaded_json(
  uploaded: unknown,
): Promise<void> {
  if (!is_json_time_tracker_db(uploaded)) {
    throw new Error('Invalid backup file: expected a time tracker database.')
  }

  const { json_db } = migrate_json_db(uploaded)
  const db = convert_json_db(json_db)

  if (db.sheets.length === 0) {
    throw new Error('Invalid backup file: the database must include at least one sheet.')
  }

  await write_db(db)
}
