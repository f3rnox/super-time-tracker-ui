import { type KeyboardShortcutSection } from '@/lib/types/keyboard_shortcut'

/**
 * Returns help sections for shortcuts available on every page.
 */
export function get_app_keyboard_shortcut_sections(
  help_key_label = '?',
): KeyboardShortcutSection[] {
  return [
    {
      title: 'General',
      entries: [
        {
          label: help_key_label,
          description: 'Show keyboard shortcuts',
        },
      ],
    },
  ]
}
