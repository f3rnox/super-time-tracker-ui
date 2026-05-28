import {
  type FocusGoalForName,
  type FocusGoalsByName,
} from "@/lib/types/focus_goals_by_name";

/**
 * Safely parses a JSON-encoded per-name focus goals map.
 */
export function parse_focus_goals_by_name(value: string): FocusGoalsByName {
  if (value.length === 0) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    const result: FocusGoalsByName = {};

    for (const [name, raw_entry] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (raw_entry === null || typeof raw_entry !== "object") {
        continue;
      }

      const entry = raw_entry as { daily?: unknown; weekly?: unknown };
      const cleaned: FocusGoalForName = {};

      if (typeof entry.daily === "string" && entry.daily.length > 0) {
        cleaned.daily = entry.daily;
      }

      if (typeof entry.weekly === "string" && entry.weekly.length > 0) {
        cleaned.weekly = entry.weekly;
      }

      if (cleaned.daily !== undefined || cleaned.weekly !== undefined) {
        result[name] = cleaned;
      }
    }

    return result;
  } catch {
    return {};
  }
}
