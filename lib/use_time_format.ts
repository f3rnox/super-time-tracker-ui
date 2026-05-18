'use client'

import { useSyncExternalStore } from 'react'

import { time_format_preference } from '@/lib/preferences/time_format_preference'
import { type TimeFormat } from '@/lib/types/ui_preferences'

/**
 * Subscribes to the time format preference for live updates in client components.
 */
export function use_time_format(): TimeFormat {
  return useSyncExternalStore(
    time_format_preference.subscribe,
    time_format_preference.get_snapshot,
    time_format_preference.get_server_snapshot,
  )
}
