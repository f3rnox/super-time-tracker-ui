import { parse_focus_goals_by_name } from "@/lib/parse_focus_goals_by_name";
import { type FocusGoalsByName } from "@/lib/types/focus_goals_by_name";

/**
 * Updates the daily or weekly target minutes for a single sheet/tag name.
 */
export function set_focus_goal_minutes_for_name(
  prev_json: string,
  name: string,
  period: "daily" | "weekly",
  minutes: string,
): string {
  if (name.length === 0) {
    return prev_json;
  }

  const parsed: FocusGoalsByName = parse_focus_goals_by_name(prev_json);
  const existing = parsed[name] ?? {};

  if (minutes.length === 0) {
    const next_entry = { ...existing };
    delete next_entry[period];

    if (next_entry.daily === undefined && next_entry.weekly === undefined) {
      delete parsed[name];
    } else {
      parsed[name] = next_entry;
    }
  } else {
    parsed[name] = {
      ...existing,
      [period]: minutes,
    };
  }

  return JSON.stringify(parsed);
}
