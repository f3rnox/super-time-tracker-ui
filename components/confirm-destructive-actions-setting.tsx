'use client'

import { useSyncExternalStore } from 'react'

import { confirm_destructive_actions_preference } from '@/lib/preferences/confirm_destructive_actions_preference'

const set_confirm_destructive_actions = (enabled: boolean): void => {
  confirm_destructive_actions_preference.write(enabled ? 'true' : 'false')
  confirm_destructive_actions_preference.notify()
}

/**
 * Setting: ask for confirmation before deleting entries or sheets.
 */
export function ConfirmDestructiveActionsSetting() {
  const value = useSyncExternalStore(
    confirm_destructive_actions_preference.subscribe,
    confirm_destructive_actions_preference.get_snapshot,
    confirm_destructive_actions_preference.get_server_snapshot,
  )
  const is_enabled = value === 'true'

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className="shrink-0"
        checked={is_enabled}
        onChange={(event) =>
          set_confirm_destructive_actions(event.target.checked)
        }
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">
          Confirm destructive actions
        </span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Ask before deleting entries or sheets. Turn off for fast mode.
        </span>
      </span>
    </label>
  )
}
