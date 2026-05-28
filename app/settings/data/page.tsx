import { DataSettingsView } from '@/components/data-settings-view'
import { collect_known_tags } from '@/lib/collect_known_tags'
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

  const sheet_names = db.sheets
    .map((sheet) => sheet.name)
    .sort((left, right) => left.localeCompare(right))
  const tag_names = collect_known_tags(db)

  return (
    <DataSettingsView
      db_path={db_path}
      db={json_db}
      sheet_names={sheet_names}
      tag_names={tag_names}
    />
  )
}
