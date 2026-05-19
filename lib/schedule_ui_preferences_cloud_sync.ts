import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

let sync_timeout: ReturnType<typeof setTimeout> | null = null

/**
 * Debounces pushing local UI preferences to the cloud API.
 */
export function schedule_ui_preferences_cloud_sync(): void {
  if (typeof window === 'undefined' || !is_supabase_configured()) {
    return
  }

  if (sync_timeout !== null) {
    clearTimeout(sync_timeout)
  }

  sync_timeout = setTimeout(() => {
    sync_timeout = null
    const preferences = collect_ui_preferences_from_window()

    void fetch('/api/ui-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences }),
    })
  }, 800)
}
