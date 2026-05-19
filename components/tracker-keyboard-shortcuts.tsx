'use client'

import { type RefObject, useMemo, useState } from 'react'

import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { type ActiveEntryPanelHandle } from '@/components/active-entry-panel'
import { type CheckInFormCollapsibleHandle } from '@/components/check-in-form-collapsible'
import { get_adjacent_sheet_name } from '@/lib/get_adjacent_sheet_name'
import { get_tracker_keyboard_shortcut_sections } from '@/lib/get_tracker_keyboard_shortcut_sections'
import { use_check_out_action } from '@/lib/use_check_out_action'
import { use_document_keyboard_shortcuts } from '@/lib/use_document_keyboard_shortcuts'
import { type KeyboardShortcutBinding } from '@/lib/types/keyboard_shortcut'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface TrackerKeyboardShortcutsProps {
  sheets: SerializedSheet[]
  active_sheet_name: string
  active_entry: SerializedEntry | null
  is_pending: boolean
  check_in_form_ref: RefObject<CheckInFormCollapsibleHandle | null>
  active_entry_panel_ref: RefObject<ActiveEntryPanelHandle | null>
  on_select_sheet: (name: string) => void
  on_check_out: (at?: string) => void
}

/**
 * Registers tracker page keyboard shortcuts and the shortcuts help dialog.
 */
export function TrackerKeyboardShortcuts({
  sheets,
  active_sheet_name,
  active_entry,
  is_pending,
  check_in_form_ref,
  active_entry_panel_ref,
  on_select_sheet,
  on_check_out,
}: TrackerKeyboardShortcutsProps) {
  const [is_help_open, set_is_help_open] = useState(false)
  const check_out = use_check_out_action(on_check_out)

  const bindings = useMemo((): KeyboardShortcutBinding[] => {
    const is_tracking = active_entry !== null

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
      {
        id: 'check-in',
        label: 'C',
        description: 'Check in (focus description)',
        key: 'c',
        is_available: () => !is_pending && !is_tracking,
        action: () => {
          check_in_form_ref.current?.expand_and_focus()
        },
      },
      {
        id: 'check-out',
        label: 'O',
        description: 'Check out',
        key: 'o',
        is_available: () => !is_pending && is_tracking,
        action: () => {
          void check_out()
        },
      },
      {
        id: 'edit-entry',
        label: 'E',
        description: 'Edit active entry',
        key: 'e',
        is_available: () => !is_pending && is_tracking,
        action: () => {
          active_entry_panel_ref.current?.start_edit()
        },
      },
      {
        id: 'add-note',
        label: 'N',
        description: 'Add note to active entry',
        key: 'n',
        is_available: () => !is_pending && is_tracking,
        action: () => {
          active_entry_panel_ref.current?.start_add_note()
        },
      },
      {
        id: 'previous-sheet',
        label: '[',
        description: 'Previous sheet',
        key: '[',
        is_available: () => !is_pending && sheets.length > 1,
        action: () => {
          const sheet_name = get_adjacent_sheet_name(
            sheets,
            active_sheet_name,
            'previous',
          )

          if (sheet_name !== null && sheet_name !== active_sheet_name) {
            on_select_sheet(sheet_name)
          }
        },
      },
      {
        id: 'next-sheet',
        label: ']',
        description: 'Next sheet',
        key: ']',
        is_available: () => !is_pending && sheets.length > 1,
        action: () => {
          const sheet_name = get_adjacent_sheet_name(
            sheets,
            active_sheet_name,
            'next',
          )

          if (sheet_name !== null && sheet_name !== active_sheet_name) {
            on_select_sheet(sheet_name)
          }
        },
      },
    ]
  }, [
    active_entry,
    active_entry_panel_ref,
    active_sheet_name,
    check_in_form_ref,
    check_out,
    is_pending,
    on_select_sheet,
    sheets,
  ])

  use_document_keyboard_shortcuts(bindings)

  if (!is_help_open) {
    return null
  }

  return (
    <KeyboardShortcutsDialog
      sections={get_tracker_keyboard_shortcut_sections()}
      on_close={() => set_is_help_open(false)}
    />
  )
}
