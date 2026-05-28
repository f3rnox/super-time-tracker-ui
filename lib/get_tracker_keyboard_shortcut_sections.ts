import { get_app_keyboard_shortcut_sections } from '@/lib/get_app_keyboard_shortcut_sections'
import { type KeyboardShortcutSection } from '@/lib/types/keyboard_shortcut'

/**
 * Returns help sections for the tracker home page.
 */
export function get_tracker_keyboard_shortcut_sections(): KeyboardShortcutSection[] {
  return [
    ...get_app_keyboard_shortcut_sections(),
    {
      title: 'Tracker',
      entries: [
        {
          label: 'C',
          description: 'Check in (focus description)',
        },
        {
          label: 'O',
          description: 'Check out',
        },
        {
          label: 'E',
          description: 'Edit active entry description',
        },
        {
          label: 'N',
          description: 'Add note to active entry',
        },
        {
          label: 'P',
          description: 'Open Pomodoro',
        },
        {
          label: '[',
          description: 'Previous sheet',
        },
        {
          label: ']',
          description: 'Next sheet',
        },
      ],
    },
  ]
}
