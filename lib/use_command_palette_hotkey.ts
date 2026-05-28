'use client'

import { useEffect } from 'react'

import { is_modal_dialog_open } from '@/lib/is_modal_dialog_open'
import { should_ignore_keyboard_shortcut } from '@/lib/should_ignore_keyboard_shortcut'

/**
 * Registers Ctrl+P (Cmd+P on macOS) to toggle the command palette.
 */
export function use_command_palette_hotkey(on_toggle: () => void): void {
  useEffect(() => {
    const handle_key_down = (event: KeyboardEvent): void => {
      const target = event.target
      const in_palette_input =
        target instanceof HTMLElement &&
        target.closest('[data-command-palette-dialog="true"]') !== null

      if (should_ignore_keyboard_shortcut(event) && !in_palette_input) {
        return
      }

      const is_palette_hotkey =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === 'p'

      if (!is_palette_hotkey) {
        return
      }

      event.preventDefault()

      if (is_modal_dialog_open()) {
        const palette_dialog = document.querySelector(
          '[data-command-palette-dialog="true"]',
        )

        if (palette_dialog === null) {
          return
        }
      }

      on_toggle()
    }

    document.addEventListener('keydown', handle_key_down)

    return () => {
      document.removeEventListener('keydown', handle_key_down)
    }
  }, [on_toggle])
}
