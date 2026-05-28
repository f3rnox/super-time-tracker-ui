/**
 * Per-name focus targets indexed by sheet or tag name.
 */
export interface FocusGoalForName {
  daily?: string
  weekly?: string
}

export type FocusGoalsByName = Record<string, FocusGoalForName>
