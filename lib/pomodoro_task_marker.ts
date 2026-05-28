"use client";

import { type SerializedEntry } from "@/lib/types/tracker_state";

const POMODORO_TASK_MARKER_STORAGE_KEY =
  "super-time-tracker-pomodoro-active-entry";

interface PomodoroTaskMarker {
  sheetName: string;
  entryId: number;
}

const parse_marker = (value: string): PomodoroTaskMarker | null => {
  try {
    const parsed = JSON.parse(value) as Partial<PomodoroTaskMarker>;

    if (
      typeof parsed.sheetName === "string" &&
      parsed.sheetName.length > 0 &&
      typeof parsed.entryId === "number" &&
      Number.isInteger(parsed.entryId)
    ) {
      return { sheetName: parsed.sheetName, entryId: parsed.entryId };
    }
  } catch {
    // Ignore malformed values.
  }

  return null;
};

const read_marker = (): PomodoroTaskMarker | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw_value = window.localStorage.getItem(
      POMODORO_TASK_MARKER_STORAGE_KEY,
    );

    if (raw_value === null) {
      return null;
    }

    return parse_marker(raw_value);
  } catch {
    return null;
  }
};

/**
 * Marks a tracker entry as Pomodoro-started for UI labeling.
 */
export function mark_pomodoro_task_entry(
  entry: Pick<SerializedEntry, "sheetName" | "id">,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const marker: PomodoroTaskMarker = {
      sheetName: entry.sheetName,
      entryId: entry.id,
    };
    window.localStorage.setItem(
      POMODORO_TASK_MARKER_STORAGE_KEY,
      JSON.stringify(marker),
    );
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Clears the current Pomodoro-started entry marker.
 */
export function clear_pomodoro_task_entry_marker(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(POMODORO_TASK_MARKER_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Returns true when the active entry matches the current Pomodoro marker.
 */
export function is_pomodoro_task_entry(entry: SerializedEntry): boolean {
  const marker = read_marker();

  return (
    marker !== null &&
    marker.sheetName === entry.sheetName &&
    marker.entryId === entry.id
  );
}
