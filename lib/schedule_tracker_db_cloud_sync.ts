import { is_greedy_cloud_sync_enabled } from '@/lib/is_greedy_cloud_sync_enabled'
import { schedule_debounced_tracker_db_push } from '@/lib/schedule_debounced_tracker_db_push'

/**
 * Schedules a cloud push when greedy sync is enabled (current default behavior).
 */
export function schedule_tracker_db_cloud_sync(): void {
  if (!is_greedy_cloud_sync_enabled()) {
    return
  }

  schedule_debounced_tracker_db_push()
}
