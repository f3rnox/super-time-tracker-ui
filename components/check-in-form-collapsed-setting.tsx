'use client'

import { useSyncExternalStore } from 'react'

import { check_in_form_collapsed_preference } from '@/lib/preferences/check_in_form_collapsed_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'

const set_check_in_form_collapsed = (collapsed: boolean): void => {
  persist_ui_preference(
    check_in_form_collapsed_preference,
    collapsed ? 'true' : 'false',
  )
}

/**
 * Setting: collapse the check-in form into a single button by default.
 */
export function CheckInFormCollapsedSetting() {
  const value = useSyncExternalStore(
    check_in_form_collapsed_preference.subscribe,
    check_in_form_collapsed_preference.get_snapshot,
    check_in_form_collapsed_preference.get_server_snapshot,
  )
  const is_collapsed = value === 'true'

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className="shrink-0"
        checked={is_collapsed}
        onChange={(event) => set_check_in_form_collapsed(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">
          Collapse check-in form
        </span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Show a single &ldquo;Check in&rdquo; button until clicked, instead of the full form.
        </span>
      </span>
    </label>
  )
}
