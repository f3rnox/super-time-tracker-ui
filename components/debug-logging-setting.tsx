'use client'

import { useSyncExternalStore } from 'react'

import { debug_logging_preference } from '@/lib/preferences/debug_logging_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'

const set_debug_logging = (enabled: boolean): void => {
  persist_ui_preference(debug_logging_preference, enabled ? 'true' : 'false')
}

/**
 * Setting: enable debug console logs for troubleshooting.
 */
export function DebugLoggingSetting() {
  const value = useSyncExternalStore(
    debug_logging_preference.subscribe,
    debug_logging_preference.get_snapshot,
    debug_logging_preference.get_server_snapshot,
  )
  const is_enabled = value === 'true'

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className="shrink-0"
        checked={is_enabled}
        onChange={(event) => set_debug_logging(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">Debug logging</span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Log outgoing AI suggestion queries in the console for troubleshooting.
        </span>
      </span>
    </label>
  )
}
