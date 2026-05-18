'use client'

import { useSyncExternalStore } from 'react'

import { duration_format_preference } from '@/lib/preferences/duration_format_preference'
import { type DurationFormat } from '@/lib/types/ui_preferences'

/**
 * Subscribes to the duration format preference for live updates in client components.
 */
export function use_duration_format(): DurationFormat {
  return useSyncExternalStore(
    duration_format_preference.subscribe,
    duration_format_preference.get_snapshot,
    duration_format_preference.get_server_snapshot,
  )
}
