import { is_greedy_cloud_sync_enabled } from "@/lib/is_greedy_cloud_sync_enabled";

/**
 * Returns whether a merge-on-load sync should run for the current route change.
 */
export function should_merge_tracker_db_on_navigation(): boolean {
  return is_greedy_cloud_sync_enabled();
}
