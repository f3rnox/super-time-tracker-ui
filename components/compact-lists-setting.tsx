'use client'

import { useSyncExternalStore } from 'react'

import {
  get_compact_lists_server_snapshot,
  get_compact_lists_snapshot,
} from '@/lib/get_compact_lists_snapshot'
import { set_compact_lists } from '@/lib/set_compact_lists'
import { subscribe_compact_lists } from '@/lib/subscribe_compact_lists'

/**
 * Toggles denser entry list rows without rounded corners.
 */
export function CompactListsSetting() {
  const compact_lists = useSyncExternalStore(
    subscribe_compact_lists,
    get_compact_lists_snapshot,
    get_compact_lists_server_snapshot,
  )

  return (
    <label className="settings-option">
      <input
        type="checkbox"
        className="settings-option__input"
        checked={compact_lists}
        onChange={(event) => set_compact_lists(event.target.checked)}
      />
      <span className="settings-option__text">
        <span className="settings-option__label">Compact lists</span>
        <span className="settings-option__hint">
          Flatter, tighter rows in the sheet entry list
        </span>
      </span>
    </label>
  )
}
