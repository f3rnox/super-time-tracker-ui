import { reset_entry_templates_snapshot_cache } from "@/lib/entry_templates_snapshots";

type EntryTemplatesListener = () => void;

const entry_templates_listeners = new Set<EntryTemplatesListener>();

/**
 * Subscribes to check-in entry template changes for useSyncExternalStore.
 */
export function subscribe_entry_templates(
  listener: EntryTemplatesListener,
): () => void {
  entry_templates_listeners.add(listener);

  return () => {
    entry_templates_listeners.delete(listener);
  };
}

/**
 * Notifies subscribers after entry templates change in local storage.
 */
export function notify_entry_templates_changed(): void {
  reset_entry_templates_snapshot_cache();
  entry_templates_listeners.forEach((listener) => {
    listener();
  });
}
