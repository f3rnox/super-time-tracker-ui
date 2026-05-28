import { ExportSettingsView } from '@/components/export-settings-view'
import { convert_db_to_json } from '@/lib/convert_db_to_json'
import { read_db } from '@/lib/read_db'

/**
 * Data export settings route.
 */
export default async function ExportSettingsPage() {
  const db = await read_db()
  const json_db = convert_db_to_json(db)

  return <ExportSettingsView db={json_db} />
}
