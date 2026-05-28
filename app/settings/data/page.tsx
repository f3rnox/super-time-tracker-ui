import { DataSettingsView } from '@/components/data-settings-view'
import { convert_db_to_json } from '@/lib/convert_db_to_json'
import { read_db } from '@/lib/read_db'
import { resolve_db_path_label } from '@/lib/resolve_db_path_label'

/**
 * Data & backup settings route.
 */
export default async function DataSettingsPage() {
  const db = await read_db()
  const json_db = convert_db_to_json(db)
  const db_path = await resolve_db_path_label()

  return <DataSettingsView db_path={db_path} db={json_db} />
}
