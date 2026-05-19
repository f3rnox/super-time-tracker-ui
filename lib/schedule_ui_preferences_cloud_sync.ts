import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { mark_pending_ui_preferences_cloud_sync } from '@/lib/pending_ui_preferences_cloud_sync'
import { run_ui_preferences_cloud_sync } from '@/lib/run_ui_preferences_cloud_sync'
import { is_ui_preferences_merge_in_progress } from '@/lib/ui_preferences_merge_guard'

let sync_timeout: ReturnType<typeof setTimeout> | null = null

/**
 * Debounces pushing local UI preferences to the cloud API.
 */
export function schedule_ui_preferences_cloud_sync(): void {
  if (typeof window === 'undefined' || !is_supabase_configured()) {
    return
  }

  if (is_ui_preferences_merge_in_progress()) {
    mark_pending_ui_preferences_cloud_sync()
    return
  }

  if (sync_timeout !== null) {
    clearTimeout(sync_timeout)
  }

  sync_timeout = setTimeout(() => {
    sync_timeout = null
    run_ui_preferences_cloud_sync()
  }, 800)
}
