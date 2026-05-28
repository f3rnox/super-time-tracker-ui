import {
  tracker_shortcut_action_ids,
  tracker_shortcut_defaults,
  type TrackerShortcutMap,
} from "@/lib/types/quick_actions";

const single_char = /^[\w\[\]\?]$/;

/**
 * Parses and sanitizes a tracker shortcut map json string.
 */
export function parse_tracker_shortcut_map(value: string): TrackerShortcutMap {
  const fallback: TrackerShortcutMap = { ...tracker_shortcut_defaults };

  try {
    const parsed = JSON.parse(value) as unknown;

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return fallback;
    }

    const candidate = parsed as Record<string, unknown>;
    const next_map: TrackerShortcutMap = { ...tracker_shortcut_defaults };

    for (const action_id of tracker_shortcut_action_ids) {
      const action_value = candidate[action_id];

      if (
        typeof action_value === "string" &&
        action_value.length === 1 &&
        single_char.test(action_value)
      ) {
        next_map[action_id] = action_value.toLowerCase();
      }
    }

    return next_map;
  } catch {
    return fallback;
  }
}
