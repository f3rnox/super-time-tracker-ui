'use client'

import { useEffect, useState } from 'react'

import { format_duration } from '@/lib/format_duration'
import { use_duration_format } from '@/lib/use_duration_format'
import { use_timer_in_title } from '@/lib/use_timer_in_title'
import { use_timer_show_seconds } from '@/lib/use_timer_show_seconds'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface TrackerDocumentTitleProps {
  active_entry: SerializedEntry | null
}

const base_title = 'super-time-tracker'

/**
 * Updates the document title with the live timer when enabled.
 */
export function TrackerDocumentTitle({ active_entry }: TrackerDocumentTitleProps) {
  const timer_in_title = use_timer_in_title()
  const duration_format = use_duration_format()
  const show_seconds = use_timer_show_seconds()
  const [duration_ms, set_duration_ms] = useState(
    active_entry?.durationMs ?? 0,
  )

  useEffect(() => {
    if (active_entry === null) {
      set_duration_ms(0)
      return
    }

    set_duration_ms(active_entry.durationMs)

    const interval = window.setInterval(() => {
      set_duration_ms(Date.now() - new Date(active_entry.start).getTime())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [active_entry])

  useEffect(() => {
    if (!timer_in_title || active_entry === null) {
      document.title = base_title
      return
    }

    const label =
      active_entry.description.trim() || 'Tracking'
    const duration = format_duration(duration_ms, duration_format, show_seconds)

    document.title = `${duration} — ${label}`

    return () => {
      document.title = base_title
    }
  }, [
    active_entry,
    duration_format,
    duration_ms,
    show_seconds,
    timer_in_title,
  ])

  return null
}
