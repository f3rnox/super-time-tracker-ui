import {
  topbar_quick_action_ids,
  type TopbarQuickActionId,
} from "@/lib/types/quick_actions";

const topbar_quick_action_set = new Set<string>(topbar_quick_action_ids);
const topbar_quick_action_defaults: TopbarQuickActionId[] = [
  "today",
  "search",
  "reporting",
  "pomodoro",
];

/**
 * Parses and sanitizes a topbar quick actions json string.
 */
export function parse_topbar_quick_actions(
  value: string,
): TopbarQuickActionId[] {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return topbar_quick_action_defaults;
    }

    const selected = parsed.filter(
      (item): item is TopbarQuickActionId =>
        typeof item === "string" && topbar_quick_action_set.has(item),
    );
    const unique_selected = Array.from(new Set<TopbarQuickActionId>(selected));

    return unique_selected;
  } catch {
    return topbar_quick_action_defaults;
  }
}
