import { type FocusGoalScope } from "@/lib/types/ui_preferences";
import { type TimeSheetEntry } from "@/lib/types";

export interface EntryMatchesFocusGoalScopeArgs {
  scope: FocusGoalScope;
  sheet_name: string | undefined;
  tag_name: string | undefined;
  sheet_name_on_entry: string;
  entry: TimeSheetEntry;
}

/**
 * Returns whether an entry counts toward a focus goal scope.
 */
export function entry_matches_focus_goal_scope(
  args: EntryMatchesFocusGoalScopeArgs,
): boolean {
  const { scope, sheet_name, tag_name, sheet_name_on_entry, entry } = args;

  if (scope === "global") {
    return true;
  }

  if (
    scope === "sheet" &&
    sheet_name !== undefined &&
    sheet_name_on_entry === sheet_name
  ) {
    return true;
  }

  if (
    scope === "tag" &&
    tag_name !== undefined &&
    entry.tags.includes(tag_name)
  ) {
    return true;
  }

  return false;
}
