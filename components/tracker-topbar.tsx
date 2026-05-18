'use client'

import Link from 'next/link'

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
          <Link className="tracker-topbar__settings" href="/settings">
            Settings
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
