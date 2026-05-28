import { PomodoroSettingsView } from '@/components/pomodoro-settings-view'
import { collect_known_tags } from '@/lib/collect_known_tags'
import { read_db } from '@/lib/read_db'

/**
 * Pomodoro settings route.
 */
export default async function PomodoroSettingsPage() {
  const db = await read_db()
  const known_tags = collect_known_tags(db)

  return <PomodoroSettingsView known_tags={known_tags} />
}
