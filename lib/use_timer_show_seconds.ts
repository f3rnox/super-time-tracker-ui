'use client'

import { useSyncExternalStore } from 'react'

import { timer_show_seconds_preference } from '@/lib/preferences/timer_show_seconds_preference'

/**
 * Subscribes to the show-seconds-on-timer preference.
 */
export function use_timer_show_seconds(): boolean {
  const value = useSyncExternalStore(
    timer_show_seconds_preference.subscribe,
    timer_show_seconds_preference.get_snapshot,
    timer_show_seconds_preference.get_server_snapshot,
  )

  return value === 'true'
}
