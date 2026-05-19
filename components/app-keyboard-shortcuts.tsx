'use client'

import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { get_app_keyboard_shortcut_sections } from '@/lib/get_app_keyboard_shortcut_sections'
import { use_document_keyboard_shortcuts } from '@/lib/use_document_keyboard_shortcuts'
import { type KeyboardShortcutBinding } from '@/lib/types/keyboard_shortcut'

/**
 * Registers app-wide keyboard shortcuts on non-tracker pages.
 */
export function AppKeyboardShortcuts() {
  const pathname = usePathname()
  const [is_help_open, set_is_help_open] = useState(false)
  const is_tracker_page = pathname === '/'

  const bindings = useMemo((): KeyboardShortcutBinding[] => {
    if (is_tracker_page) {
      return []
    }

    return [
      {
        id: 'help',
        label: '?',
        description: 'Show keyboard shortcuts',
        key: '?',
        modifiers: ['shift'],
        action: () => {
          set_is_help_open((open) => !open)
        },
      },
    ]
  }, [is_tracker_page])

  use_document_keyboard_shortcuts(bindings)

  if (!is_help_open || is_tracker_page) {
    return null
  }

  return (
    <KeyboardShortcutsDialog
      sections={get_app_keyboard_shortcut_sections()}
      on_close={() => set_is_help_open(false)}
    />
  )
}
