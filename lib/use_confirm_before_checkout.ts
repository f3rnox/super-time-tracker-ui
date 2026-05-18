'use client'

import { useSyncExternalStore } from 'react'

import { confirm_before_checkout_preference } from '@/lib/preferences/confirm_before_checkout_preference'

/**
 * Subscribes to the confirm-before-checkout preference (boolean).
 */
export function use_confirm_before_checkout(): boolean {
  const value = useSyncExternalStore(
    confirm_before_checkout_preference.subscribe,
    confirm_before_checkout_preference.get_snapshot,
    confirm_before_checkout_preference.get_server_snapshot,
  )

  return value === 'true'
}
