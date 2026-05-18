'use client'

import { useEffect } from 'react'

import { apply_theme } from '@/lib/apply_theme'
import { notify_theme_subscribers } from '@/lib/subscribe_theme'
import { resolve_theme_mode_to_theme } from '@/lib/resolve_theme_mode_to_theme'
import { theme_mode_preference } from '@/lib/preferences/theme_mode_preference'
import { write_stored_theme } from '@/lib/write_stored_theme'

/**
 * Listens to OS-level theme changes and re-applies the theme when the
 * user's mode preference is "system".
 */
export function ThemeModeSystemListener() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: light)')

    const handle_change = (): void => {
      if (theme_mode_preference.read() !== 'system') {
        return
      }

      const resolved = resolve_theme_mode_to_theme('system')

      apply_theme(resolved)
      write_stored_theme(resolved)
      notify_theme_subscribers()
    }

    media.addEventListener('change', handle_change)

    return () => {
      media.removeEventListener('change', handle_change)
    }
  }, [])

  return null
}
