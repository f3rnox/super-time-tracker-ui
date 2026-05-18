'use client'

import { ThemeSwitcher } from '@/components/theme_switcher'

/**
 * Sticky app navbar with branding and theme switcher.
 */
export function TrackerTopbar() {
  return (
    <header className="tracker-topbar">
      <div className="tracker-topbar__inner">
        <span className="tracker-topbar__brand">super-time-tracker</span>
        <div className="tracker-topbar__actions">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
