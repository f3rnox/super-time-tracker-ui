'use client'

import { useEffect, useState } from 'react'

import { ThemeSwitcher } from '@/components/theme_switcher'
import { format_duration } from '@/lib/format_duration'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface TrackerTopbarProps {
  active_sheet_name: string
  active_entry: SerializedEntry | null
}

/**
 * Sticky app bar showing the active sheet and running entry.
 */
export function TrackerTopbar({
  active_sheet_name,
  active_entry,
}: TrackerTopbarProps) {
  const [duration_ms, set_duration_ms] = useState(
    active_entry?.durationMs ?? 0,
  )

  useEffect(() => {
    if (active_entry === null) {
      return
    }

    set_duration_ms(active_entry.durationMs)

    const interval = window.setInterval(() => {
      set_duration_ms(Date.now() - new Date(active_entry.start).getTime())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [active_entry])

  const entry_label =
    active_entry === null
      ? null
      : active_entry.description.trim().length > 0
        ? active_entry.description
        : 'Untitled entry'

  return (
    <header className="tracker-topbar">
      <div className="tracker-topbar__inner">
        <p className="tracker-topbar__brand">super-time-tracker</p>
        <div className="tracker-topbar__status">
          <span className="tracker-topbar__sheet">{active_sheet_name}</span>
          {active_entry !== null ? (
            <>
              <span className="tracker-topbar__divider" aria-hidden="true">
                /
              </span>
              <span className="tracker-topbar__entry">
                <span className="tracker-topbar__badge">Tracking</span>
                <span className="tracker-topbar__entry-title">
                  {entry_label}
                </span>
                <span className="tracker-topbar__duration">
                  {format_duration(duration_ms)}
                </span>
              </span>
            </>
          ) : (
            <span className="tracker-topbar__idle">No active entry</span>
          )}
        </div>
        <div className="tracker-topbar__actions">
          <ThemeSwitcher />
        </div>
        </div>
    </header>
  )
}
