'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { HelpIcon } from '@/components/help-icon'
import { KeyboardShortcutsContent } from '@/components/keyboard-shortcuts-content'
import { get_app_keyboard_shortcut_sections } from '@/lib/get_app_keyboard_shortcut_sections'
import { get_tracker_keyboard_shortcut_sections } from '@/lib/get_tracker_keyboard_shortcut_sections'

/**
 * Topbar help control with a hover tooltip listing keyboard shortcuts.
 */
export function KeyboardShortcutsHelpButton() {
  const pathname = usePathname()
  const sections = useMemo(
    () =>
      pathname === '/'
        ? get_tracker_keyboard_shortcut_sections()
        : get_app_keyboard_shortcut_sections(),
    [pathname],
  )

  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-panel-border bg-ghost-bg text-muted hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Keyboard shortcuts"
        aria-describedby="keyboard-shortcuts-tooltip"
      >
        <HelpIcon />
      </button>
      <div
        id="keyboard-shortcuts-tooltip"
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 w-max max-w-[min(18rem,calc(100vw-2.5rem))] pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
      >
        <div className="rounded-lg border border-panel-border bg-panel p-3 shadow-md">
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
            Keyboard shortcuts
          </p>
          <div className="mt-2">
            <KeyboardShortcutsContent sections={sections} compact />
          </div>
        </div>
      </div>
    </div>
  )
}
