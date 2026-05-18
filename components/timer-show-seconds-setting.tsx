'use client'

import { useSyncExternalStore } from 'react'

import { timer_show_seconds_preference } from '@/lib/preferences/timer_show_seconds_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'

const set_timer_show_seconds = (enabled: boolean): void => {
  persist_ui_preference(
    timer_show_seconds_preference,
    enabled ? 'true' : 'false',
  )
}

/**
 * Setting: show seconds on the active timer display.
 */
export function TimerShowSecondsSetting() {
  const value = useSyncExternalStore(
    timer_show_seconds_preference.subscribe,
    timer_show_seconds_preference.get_snapshot,
    timer_show_seconds_preference.get_server_snapshot,
  )

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className="shrink-0"
        checked={value === 'true'}
        onChange={(event) => set_timer_show_seconds(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">Show seconds on timer</span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Include seconds on the live active timer (humanized duration format).
        </span>
      </span>
    </label>
  )
}
