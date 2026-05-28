type TrackerStateSyncListener = () => void;

const listeners = new Set<TrackerStateSyncListener>();

/**
 * Subscribes to notifications that local tracker state may have changed via sync.
 */
export function subscribe_tracker_state_sync(
  listener: TrackerStateSyncListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Notifies listeners to refresh tracker state from /api/state.
 */
export function notify_tracker_state_sync(): void {
  if (typeof window === "undefined") {
    return;
  }

  listeners.forEach((listener) => {
    listener();
  });
}
