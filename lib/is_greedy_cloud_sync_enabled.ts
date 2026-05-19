import { greedy_cloud_sync_preference } from '@/lib/preferences/greedy_cloud_sync_preference'

/**
 * Returns whether greedy cloud sync is enabled in the browser.
 */
export function is_greedy_cloud_sync_enabled(): boolean {
  return greedy_cloud_sync_preference.read() === 'true'
}
