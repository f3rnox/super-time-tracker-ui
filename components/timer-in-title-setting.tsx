'use client'

import { useSyncExternalStore } from 'react'

import { timer_in_title_preference } from '@/lib/preferences/timer_in_title_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'

const set_timer_in_title = (enabled: boolean): void => {
  persist_ui_preference(timer_in_title_preference, enabled ? 'true' : 'false')
}

/**
 * Setting: show the live timer in the browser tab title.
 */
export function TimerInTitleSetting() {
  const value = useSyncExternalStore(
    timer_in_title_preference.subscribe,
    timer_in_title_preference.get_snapshot,
    timer_in_title_preference.get_server_snapshot,
  )

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className="shrink-0"
        checked={value === 'true'}
        onChange={(event) => set_timer_in_title(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">Timer in tab title</span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Show elapsed time in the browser tab while a timer is running.
        </span>
      </span>
    </label>
  )
}
