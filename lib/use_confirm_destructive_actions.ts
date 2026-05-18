'use client'

import { useSyncExternalStore } from 'react'

import { confirm_destructive_actions_preference } from '@/lib/preferences/confirm_destructive_actions_preference'

/**
 * Subscribes to the confirm-destructive-actions preference (boolean).
 */
export function use_confirm_destructive_actions(): boolean {
  const value = useSyncExternalStore(
    confirm_destructive_actions_preference.subscribe,
    confirm_destructive_actions_preference.get_snapshot,
    confirm_destructive_actions_preference.get_server_snapshot,
  )

  return value === 'true'
}
