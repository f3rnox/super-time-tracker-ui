'use client'

import { useSyncExternalStore } from 'react'

import { confirm_before_checkout_preference } from '@/lib/preferences/confirm_before_checkout_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'

const set_confirm_before_checkout = (enabled: boolean): void => {
  persist_ui_preference(
    confirm_before_checkout_preference,
    enabled ? 'true' : 'false',
  )
}

/**
 * Setting: ask for confirmation before checking out of an active timer.
 */
export function ConfirmBeforeCheckoutSetting() {
  const value = useSyncExternalStore(
    confirm_before_checkout_preference.subscribe,
    confirm_before_checkout_preference.get_snapshot,
    confirm_before_checkout_preference.get_server_snapshot,
  )
  const is_enabled = value === 'true'

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className="shrink-0"
        checked={is_enabled}
        onChange={(event) => set_confirm_before_checkout(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">Confirm before checkout</span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Show a confirmation dialog when you stop the active timer.
        </span>
      </span>
    </label>
  )
}
