import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { is_cloud_sync_enabled } from '@/lib/is_cloud_sync_enabled'
import { notify_cloud_db_sync } from '@/lib/notify_cloud_db_sync'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

/**
 * Pushes all local UI preferences to the cloud API immediately.
 */
export function run_ui_preferences_cloud_sync(): void {
  if (
    typeof window === 'undefined' ||
    !is_supabase_configured() ||
    !is_cloud_sync_enabled()
  ) {
    return
  }

  const preferences = collect_ui_preferences_from_window()

  if (Object.keys(preferences).length === 0) {
    return
  }

  notify_cloud_db_sync({
    phase: 'syncing',
    message: 'Syncing settings to cloud…',
  })

  void fetch('/api/ui-preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Settings sync failed')
      }

      notify_cloud_db_sync({
        phase: 'success',
        message: 'Settings synced',
      })
    })
    .catch((error: unknown) => {
      notify_cloud_db_sync({
        phase: 'error',
        message:
          error instanceof Error ? error.message : 'Settings sync failed',
      })
    })
}
