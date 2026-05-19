import { is_greedy_cloud_sync_enabled } from '@/lib/is_greedy_cloud_sync_enabled'
import { push_cloud_active_sheet_name } from '@/lib/push_cloud_active_sheet_name'
import { push_tracker_db_cloud_after_change } from '@/lib/push_tracker_db_cloud_after_change'
import { schedule_tracker_db_cloud_sync } from '@/lib/schedule_tracker_db_cloud_sync'

/**
 * Schedules cloud sync after a tracker API call based on greedy sync preference.
 */
export function notify_tracker_db_cloud_sync(
  path: string,
  body: unknown,
): void {
  const is_sheet_switch =
    path === '/api/sheet' &&
    typeof body === 'object' &&
    body !== null &&
    (body as { delete?: boolean }).delete !== true

  if (is_sheet_switch && !is_greedy_cloud_sync_enabled()) {
    const sheet_name = (body as { name?: string }).name?.trim() ?? ''

    if (sheet_name.length > 0) {
      void push_cloud_active_sheet_name(sheet_name).catch(() => {
        // Full push will reconcile on the next data change or manual sync.
      })
    }

    return
  }

  if (is_greedy_cloud_sync_enabled()) {
    schedule_tracker_db_cloud_sync()
    return
  }

  push_tracker_db_cloud_after_change()
}
