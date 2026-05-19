import { schedule_tracker_db_cloud_sync } from '@/lib/schedule_tracker_db_cloud_sync'
import { type TrackerState } from '@/lib/types/tracker_state'

/**
 * Posts a JSON body to a tracker API route and returns updated state.
 */
export async function post_tracker_action(
  path: string,
  body: unknown,
): Promise<TrackerState> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string }
    throw new Error(payload.error ?? 'Request failed')
  }

  const state = (await response.json()) as TrackerState

  schedule_tracker_db_cloud_sync()

  return state
}
