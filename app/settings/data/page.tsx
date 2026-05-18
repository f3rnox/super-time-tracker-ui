import { DataSettingsView } from '@/components/data-settings-view'
import { DB_PATH } from '@/lib/config'

/**
 * Data & backup settings route.
 */
export default function DataSettingsPage() {
  return <DataSettingsView db_path={DB_PATH} />
}
