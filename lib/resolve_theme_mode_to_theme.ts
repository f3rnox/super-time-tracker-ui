import { type ThemeMode } from '@/lib/types/ui_preferences'
import { type Theme } from '@/lib/types/theme'

/**
 * Resolves a theme mode preference to the applied light/dark theme.
 */
export function resolve_theme_mode_to_theme(mode: ThemeMode): Theme {
  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}
