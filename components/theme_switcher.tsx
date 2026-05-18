'use client'

import { useSyncExternalStore } from 'react'

import { get_theme_server_snapshot, get_theme_snapshot } from '@/lib/get_theme_snapshot'
import { subscribe_theme } from '@/lib/subscribe_theme'
import { toggle_theme } from '@/lib/toggle_theme'

/**
 * Toggles between light and dark themes.
 */
export function ThemeSwitcher() {
  const theme = useSyncExternalStore(
    subscribe_theme,
    get_theme_snapshot,
    get_theme_server_snapshot,
  )

  const active_label = theme === 'dark' ? 'Dark' : 'Light'
  const switch_label =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className="theme-switcher"
      onClick={toggle_theme}
      aria-label={`${active_label} theme. ${switch_label}`}
      title={switch_label}
      suppressHydrationWarning
    >
      <span className="theme-switcher__icon" aria-hidden="true">
        {theme === 'dark' ? '☾' : '☀'}
      </span>
      <span className="theme-switcher__label" suppressHydrationWarning>
        {active_label}
      </span>
    </button>
  )
}
