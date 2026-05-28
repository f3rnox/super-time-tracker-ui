export const tracker_shortcut_action_ids = [
  'help',
  'check-in',
  'check-out',
  'edit-entry',
  'add-note',
  'pomodoro',
  'previous-sheet',
  'next-sheet',
] as const

export type TrackerShortcutActionId = (typeof tracker_shortcut_action_ids)[number]

export type TrackerShortcutMap = Record<TrackerShortcutActionId, string>

export const tracker_shortcut_defaults: TrackerShortcutMap = {
  help: '?',
  'check-in': 'c',
  'check-out': 'o',
  'edit-entry': 'e',
  'add-note': 'n',
  pomodoro: 'p',
  'previous-sheet': '[',
  'next-sheet': ']',
}

export const topbar_quick_action_ids = [
  'today',
  'search',
  'sheets',
  'reporting',
  'pomodoro',
  'manage-tags',
  'sync-settings',
] as const

export type TopbarQuickActionId = (typeof topbar_quick_action_ids)[number]
