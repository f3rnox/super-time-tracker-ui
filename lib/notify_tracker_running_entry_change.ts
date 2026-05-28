import { get_running_entry_key } from "@/lib/get_running_entry_key";
import { notify_desktop } from "@/lib/notify_desktop";
import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Sends a desktop notification when the running entry changes.
 */
export function notify_tracker_running_entry_change(
  previous_running_entry: SerializedEntry | null,
  next_running_entry: SerializedEntry | null,
): void {
  if (previous_running_entry === null && next_running_entry !== null) {
    notify_desktop({
      title: "Tracking started",
      body: `${next_running_entry.description || "Untitled entry"} (${next_running_entry.sheetName})`,
      tag: "tracker-running-entry",
    });
    return;
  }

  if (previous_running_entry !== null && next_running_entry === null) {
    notify_desktop({
      title: "Tracking stopped",
      body: `${previous_running_entry.description || "Untitled entry"} (${previous_running_entry.sheetName})`,
      tag: "tracker-running-entry",
    });
    return;
  }

  if (
    previous_running_entry === null ||
    next_running_entry === null ||
    get_running_entry_key(previous_running_entry) ===
      get_running_entry_key(next_running_entry)
  ) {
    return;
  }

  notify_desktop({
    title: "Tracking switched",
    body: `${next_running_entry.description || "Untitled entry"} (${next_running_entry.sheetName})`,
    tag: "tracker-running-entry",
  });
}
