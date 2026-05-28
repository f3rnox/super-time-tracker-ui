import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { is_cloud_sync_enabled } from '@/lib/is_cloud_sync_enabled'
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

  void fetch('/api/ui-preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  })
}
