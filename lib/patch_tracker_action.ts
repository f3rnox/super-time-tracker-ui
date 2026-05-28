import { notify_tracker_db_cloud_sync } from '@/lib/notify_tracker_db_cloud_sync'
import { type TrackerState } from '@/lib/types/tracker_state'

const duplicate_key_retryable_paths = new Set(['/api/note'])

const is_duplicate_key_error = (message: string): boolean => {
  const normalized = message.toLowerCase()

  return normalized.includes('duplicate key') || normalized.includes('unique constraint')
}

const is_retryable_note_duplicate_error = (
  path: string,
  message: string,
): boolean => duplicate_key_retryable_paths.has(path) && is_duplicate_key_error(message)

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

/**
 * Sends a PATCH request to a tracker API route and returns updated state.
 */
export async function patch_tracker_action(
  path: string,
  body: unknown,
): Promise<TrackerState> {
  const request_init: RequestInit = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
  let response = await fetch(path, request_init)

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string }
    const message = payload.error ?? 'Request failed'

    if (is_retryable_note_duplicate_error(path, message)) {
      await sleep(25)
      response = await fetch(path, request_init)

      if (!response.ok) {
        const retry_payload = (await response.json()) as { error?: string }
        throw new Error(retry_payload.error ?? message)
      }
    } else {
      throw new Error(message)
    }
  }

  const state = (await response.json()) as TrackerState

  notify_tracker_db_cloud_sync(path, body)

  return state
}
