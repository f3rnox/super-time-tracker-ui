type CompactListsListener = () => void;

const compact_lists_listeners = new Set<CompactListsListener>();

/**
 * Subscribes to compact lists setting changes for useSyncExternalStore.
 */
export function subscribe_compact_lists(
  listener: CompactListsListener,
): () => void {
  compact_lists_listeners.add(listener);

  return () => {
    compact_lists_listeners.delete(listener);
  };
}

/**
 * Notifies subscribers after the compact lists setting changes.
 */
export function notify_compact_lists_subscribers(): void {
  compact_lists_listeners.forEach((listener) => {
    listener();
  });
}
