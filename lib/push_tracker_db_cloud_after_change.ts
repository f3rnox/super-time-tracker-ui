import { is_greedy_cloud_sync_enabled } from '@/lib/is_greedy_cloud_sync_enabled'
import { schedule_debounced_tracker_db_push } from '@/lib/schedule_debounced_tracker_db_push'
import { schedule_tracker_db_cloud_sync } from '@/lib/schedule_tracker_db_cloud_sync'

/**
 * Queues a cloud push after tracker data changed (non-greedy mode).
 */
export function push_tracker_db_cloud_after_change(): void {
  if (is_greedy_cloud_sync_enabled()) {
    schedule_tracker_db_cloud_sync()
    return
  }

  schedule_debounced_tracker_db_push()
}
