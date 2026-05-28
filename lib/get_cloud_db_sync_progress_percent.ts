import { type CloudDbSyncPhase } from "@/lib/notify_cloud_db_sync";

/**
 * Maps a cloud sync toast phase to a determinate progress width, or null while syncing.
 */
export function get_cloud_db_sync_progress_percent(
  phase: CloudDbSyncPhase,
): number | null {
  if (phase === "success") {
    return 100;
  }

  if (phase === "error") {
    return 0;
  }

  return null;
}
