import { mark_tracker_db_merged_this_browser_session } from '@/lib/has_tracker_db_merged_this_browser_session'
import { notify_cloud_db_sync } from '@/lib/notify_cloud_db_sync'

export interface RunTrackerDbCloudSyncOptions {
  merge_on_load?: boolean
  action?: 'push' | 'pull'
  on_complete?: () => void
}

/**
 * Merges on load when requested, pushes or pulls tracker data, and drives the sync toast.
 */
export async function run_tracker_db_cloud_sync(
  options: RunTrackerDbCloudSyncOptions = {},
): Promise<void> {
  const action = options.action ?? 'push'
  const syncing_message =
    action === 'pull' ? 'Pulling from cloud…' : 'Syncing to cloud…'
  const success_message =
    action === 'pull' ? 'Cloud pull complete' : 'Cloud sync complete'

  notify_cloud_db_sync({ phase: 'syncing', message: syncing_message })

  try {
    if (options.merge_on_load === true) {
      const merge_response = await fetch('/api/sync/merge-on-load', {
        method: 'POST',
      })

      if (!merge_response.ok) {
        const body = (await merge_response.json()) as { error?: string }
        throw new Error(body.error ?? 'Merge on load failed')
      }
    }

    const push_url =
      options.merge_on_load === true && action === 'push'
        ? '/api/sync/push?verbatim=true'
        : `/api/sync/${action}`

    const sync_response = await fetch(push_url, { method: 'POST' })

    if (!sync_response.ok) {
      const body = (await sync_response.json()) as { error?: string }
      throw new Error(body.error ?? `${action} failed`)
    }

    if (options.merge_on_load === true) {
      mark_tracker_db_merged_this_browser_session()
    }

    notify_cloud_db_sync({ phase: 'success', message: success_message })
    options.on_complete?.()
  } catch (sync_error: unknown) {
    const message =
      sync_error instanceof Error ? sync_error.message : String(sync_error)

    notify_cloud_db_sync({ phase: 'error', message })
    throw sync_error
  }
}
