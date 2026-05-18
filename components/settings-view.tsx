'use client'

import Link from 'next/link'

import { CompactListsSetting } from '@/components/compact-lists-setting'
import { TrackerTopbar } from '@/components/tracker-topbar'

/**
 * Settings screen for UI preferences.
 */
export function SettingsView() {
  return (
    <>
      <TrackerTopbar />
      <main className="settings-page">
        <header className="settings-page__header">
          <h1 className="settings-page__title">Settings</h1>
          <Link className="settings-page__back" href="/">
            Back to tracker
          </Link>
        </header>
        <ul className="settings-list" aria-label="Settings">
          <li className="settings-list__item">
            <CompactListsSetting />
          </li>
        </ul>
      </main>
    </>
  )
}
