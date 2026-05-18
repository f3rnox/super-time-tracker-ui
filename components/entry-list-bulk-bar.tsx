'use client'

import { useState } from 'react'

import { type SerializedEntry, type SerializedSheet } from '@/lib/types/tracker_state'

interface EntryListBulkBarProps {
  selected_count: number
  selected_entries: SerializedEntry[]
  sheets: SerializedSheet[]
  is_pending: boolean
  on_move: (target_sheet_name: string) => void
  on_clear: () => void
}

/**
 * Bulk actions toolbar for a multi-selected entry list.
 */
export function EntryListBulkBar({
  selected_count,
  selected_entries,
  sheets,
  is_pending,
  on_move,
  on_clear,
}: EntryListBulkBarProps) {
  const [target_sheet_name, set_target_sheet_name] = useState('')
  const has_active_selection = selected_entries.some((entry) => entry.isActive)
  const movable_sheets = sheets.filter((sheet) => {
    if (has_active_selection && sheet.hasActiveEntry) {
      return false
    }

    return selected_entries.some((entry) => entry.sheetName !== sheet.name)
  })

  const handle_move = (): void => {
    const trimmed = target_sheet_name.trim()

    if (trimmed.length === 0) {
      return
    }

    on_move(trimmed)
    set_target_sheet_name('')
  }

  return (
    <div className="entry-list-bulk-bar">
      <p className="entry-list-bulk-bar__count">
        {selected_count} selected
      </p>
      <label className="entry-list-bulk-bar__target">
        <span className="entry-list-bulk-bar__label">Move to sheet</span>
        <select
          className="input input--compact"
          value={target_sheet_name}
          disabled={is_pending || movable_sheets.length === 0}
          onChange={(event) => set_target_sheet_name(event.target.value)}
        >
          <option value="">Choose sheet…</option>
          {movable_sheets.map((sheet) => (
            <option key={sheet.name} value={sheet.name}>
              {sheet.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="button button--ghost"
        disabled={
          is_pending ||
          target_sheet_name.trim().length === 0 ||
          movable_sheets.length === 0
        }
        onClick={handle_move}
      >
        Move selected
      </button>
      <button
        type="button"
        className="button button--ghost"
        disabled={is_pending}
        onClick={on_clear}
      >
        Clear
      </button>
    </div>
  )
}
