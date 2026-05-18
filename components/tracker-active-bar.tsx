'use client'

import { useEffect, useState } from 'react'

import { format_duration } from '@/lib/format_duration'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface TrackerActiveBarProps {
  active_sheet_name: string
  active_entry: SerializedEntry | null
}

/**
 * Full-width bar showing the active sheet and running entry below the navbar.
 */
export function TrackerActiveBar({
  active_sheet_name,
  active_entry,
}: TrackerActiveBarProps) {
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
    <div className="tracker-active-bar">
      <div className="tracker-active-bar__inner">
        <div className="tracker-active-bar__sheet-group">
          <span className="tracker-active-bar__label">Sheet</span>
          <span className="tracker-active-bar__sheet">{active_sheet_name}</span>
        </div>
        {active_entry !== null ? (
          <div className="tracker-active-bar__entry-group">
            <span className="tracker-active-bar__badge">Live</span>
            <span className="tracker-active-bar__entry-title">
              {entry_label}
            </span>
            <span className="tracker-active-bar__duration">
              {format_duration(duration_ms)}
            </span>
          </div>
        ) : (
          <span className="tracker-active-bar__idle">Not tracking</span>
        )}
      </div>
    </div>
  )
}
