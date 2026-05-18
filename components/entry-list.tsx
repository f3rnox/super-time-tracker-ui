'use client'

import { format_duration } from '@/lib/format_duration'
import { type SerializedEntry } from '@/lib/types/tracker_state'
import { format_time } from '@/components/format_time'

interface EntryListProps {
  entries: SerializedEntry[]
  total_ms: number
}

/**
 * Renders today&apos;s entries in reverse chronological order.
 */
export function EntryList({ entries, total_ms }: EntryListProps) {
  return (
    <section className="entry-list-section">
      <header className="entry-list-section__header">
        <h2 className="entry-list-section__title">Today</h2>
        <p className="entry-list-section__total">
          {format_duration(total_ms)} total
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="entry-list-section__empty">No entries yet today.</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={`${entry.sheetName}-${entry.id}`} className="entry-row">
              <div className="entry-row__main">
                <p className="entry-row__description">
                  {entry.description || 'Untitled entry'}
                </p>
                <p className="entry-row__meta">
                  <span>{entry.sheetName}</span>
                  <span>·</span>
                  <span>
                    {format_time(entry.start)}
                    {entry.end === null
                      ? ' → now'
                      : ` → ${format_time(entry.end)}`}
                  </span>
                </p>
                {entry.tags.length > 0 ? (
                  <ul className="tag-list tag-list--inline">
                    {entry.tags.map((tag) => (
                      <li key={tag} className="tag-list__item">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p
                className={`entry-row__duration${
                  entry.isActive ? ' entry-row__duration--active' : ''
                }`}
              >
                {format_duration(entry.durationMs)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
