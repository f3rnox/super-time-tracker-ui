import { type SerializedEntry } from "@/lib/types/tracker_state";

export interface TrackerRunningEntrySnapshot {
  runningEntry: SerializedEntry | null;
}

type TrackerRunningEntryListener = () => void;

let running_entry_snapshot: TrackerRunningEntrySnapshot = {
  runningEntry: null,
};

const listeners = new Set<TrackerRunningEntryListener>();

/**
 * Publishes the running entry for background notification checks.
 */
export function publish_tracker_running_entry(
  running_entry: SerializedEntry | null,
): void {
  running_entry_snapshot = { runningEntry: running_entry };
  listeners.forEach((listener) => {
    listener();
  });
}

/**
 * Subscribes to running-entry updates from the tracker UI.
 */
export function subscribe_tracker_running_entry(
  listener: TrackerRunningEntryListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Returns the latest running entry published by the tracker UI.
 */
export function get_tracker_running_entry_snapshot(): TrackerRunningEntrySnapshot {
  return running_entry_snapshot;
}
