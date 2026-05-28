export type CloudDbSyncPhase = "syncing" | "success" | "error";

export interface CloudDbSyncNotification {
  phase: CloudDbSyncPhase;
  message: string;
}

type CloudDbSyncListener = (
  notification: CloudDbSyncNotification | null,
) => void;

const listeners = new Set<CloudDbSyncListener>();

/**
 * Subscribes to cloud database sync toast updates.
 */
export function subscribe_cloud_db_sync(
  listener: CloudDbSyncListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Updates the cloud sync toast (syncing, success, or error).
 */
export function notify_cloud_db_sync(
  notification: CloudDbSyncNotification | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  listeners.forEach((listener) => {
    listener(notification);
  });
}
