import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { is_cloud_sync_enabled } from '@/lib/is_cloud_sync_enabled'
import { run_tracker_db_cloud_sync } from '@/lib/run_tracker_db_cloud_sync'

let debounce_timer: ReturnType<typeof setTimeout> | null = null
let sync_chain: Promise<void> = Promise.resolve()

/**
 * Debounces a background push of local db.json to Supabase.
 */
export function schedule_debounced_tracker_db_push(): void {
  if (
    typeof window === 'undefined' ||
    !is_supabase_configured() ||
    !is_cloud_sync_enabled()
  ) {
    return
  }

  if (debounce_timer !== null) {
    clearTimeout(debounce_timer)
  }

  debounce_timer = setTimeout(() => {
    debounce_timer = null
    sync_chain = sync_chain
      .then(() => run_tracker_db_cloud_sync())
      .catch(() => {
        // Errors are surfaced via the cloud sync toast.
      })
  }, 400)
}
