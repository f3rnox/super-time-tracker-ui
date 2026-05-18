'use client'

import { useEffect, useState } from 'react'

import { format_duration } from '@/lib/format_duration'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface ActiveEntryPanelProps {
  entry: SerializedEntry
  on_check_out: () => void
  is_pending: boolean
}

/**
 * Shows the running active entry with a live duration timer.
 */
export function ActiveEntryPanel({
  entry,
  on_check_out,
  is_pending,
}: ActiveEntryPanelProps) {
  const [duration_ms, set_duration_ms] = useState(
    () => Date.now() - new Date(entry.start).getTime(),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      set_duration_ms(Date.now() - new Date(entry.start).getTime())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [entry.start])

  return (
    <section className="active-panel">
      <span className="active-panel__badge">Tracking</span>
      <p className="active-panel__sheet">{entry.sheetName}</p>
      <h2 className="active-panel__title">
        {entry.description || 'Untitled entry'}
      </h2>
      <p className="active-panel__duration">{format_duration(duration_ms)}</p>
      {entry.tags.length > 0 ? (
        <ul className="tag-list">
          {entry.tags.map((tag) => (
            <li key={tag} className="tag-list__item">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        className="button button--danger"
        disabled={is_pending}
        onClick={on_check_out}
      >
        Check out
      </button>
    </section>
  )
}
