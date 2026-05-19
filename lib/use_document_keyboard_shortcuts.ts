'use client'

import { useEffect, useRef } from 'react'

import { keyboard_event_matches_binding } from '@/lib/keyboard_event_matches_binding'
import { should_ignore_keyboard_shortcut } from '@/lib/should_ignore_keyboard_shortcut'
import { type KeyboardShortcutBinding } from '@/lib/types/keyboard_shortcut'

/**
 * Registers document-level keyboard shortcuts for the lifetime of the component.
 */
export function use_document_keyboard_shortcuts(
  bindings: KeyboardShortcutBinding[],
): void {
  const bindings_ref = useRef(bindings)
  bindings_ref.current = bindings

  useEffect(() => {
    const handle_key_down = (event: KeyboardEvent): void => {
      if (should_ignore_keyboard_shortcut(event)) {
        return
      }

      if (document.querySelector('[role="dialog"][aria-modal="true"]') !== null) {
        return
      }

      for (const binding of bindings_ref.current) {
        if (binding.is_available?.() === false) {
          continue
        }

        if (!keyboard_event_matches_binding(event, binding)) {
          continue
        }

        event.preventDefault()
        binding.action()
        return
      }
    }

    document.addEventListener('keydown', handle_key_down)

    return () => {
      document.removeEventListener('keydown', handle_key_down)
    }
  }, [])
}
