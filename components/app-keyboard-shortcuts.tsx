'use client'

import { usePathname } from 'next/navigation'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { get_tracker_keyboard_shortcut_sections } from '@/lib/get_tracker_keyboard_shortcut_sections'
import { parse_tracker_shortcut_map } from '@/lib/parse_tracker_shortcut_map'
import { tracker_shortcut_map_preference } from '@/lib/preferences/tracker_shortcut_map_preference'
import { use_document_keyboard_shortcuts } from '@/lib/use_document_keyboard_shortcuts'
import { type KeyboardShortcutBinding } from '@/lib/types/keyboard_shortcut'

/**
 * Registers app-wide keyboard shortcuts on non-tracker pages.
 */
export function AppKeyboardShortcuts() {
  const pathname = usePathname()
  const [is_help_open, set_is_help_open] = useState(false)
  const is_tracker_page = pathname === '/'
  const shortcut_map_json = useSyncExternalStore(
    tracker_shortcut_map_preference.subscribe,
    tracker_shortcut_map_preference.get_snapshot,
    tracker_shortcut_map_preference.get_server_snapshot,
  )
  const shortcut_map = useMemo(
    () => parse_tracker_shortcut_map(shortcut_map_json),
    [shortcut_map_json],
  )
  const help_key = shortcut_map.help
  const help_modifiers: ('shift')[] | [] = help_key === '?' ? ['shift'] : []

  const bindings = useMemo((): KeyboardShortcutBinding[] => {
    if (is_tracker_page) {
      return []
    }

    return [
      {
        id: 'help',
        label: help_key === '?' ? '?' : help_key.toUpperCase(),
        description: 'Show keyboard shortcuts',
        key: help_key,
        modifiers: help_modifiers,
        action: () => {
          set_is_help_open((open) => !open)
        },
      },
    ]
  }, [help_key, help_modifiers, is_tracker_page])

  use_document_keyboard_shortcuts(bindings)

  if (!is_help_open || is_tracker_page) {
    return null
  }

  return (
    <KeyboardShortcutsDialog
      sections={get_tracker_keyboard_shortcut_sections(shortcut_map)}
      on_close={() => set_is_help_open(false)}
    />
  )
}
