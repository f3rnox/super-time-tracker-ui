import { DataSettingsView } from '@/components/data-settings-view'
import { resolve_db_path_label } from '@/lib/resolve_db_path_label'

/**
 * Data & backup settings route.
 */
export default async function DataSettingsPage() {
  const db_path = await resolve_db_path_label()

  return <DataSettingsView db_path={db_path} />
}
