'use client'

import { ActiveEntryPanel } from '@/components/active-entry-panel'
import { type EntryEditFormValues } from '@/components/entry-edit-form'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface TrackerActiveBarProps {
  active_sheet_name: string
  active_entry: SerializedEntry | null
  sheets: SerializedSheet[]
  is_pending: boolean
  on_check_out: (at?: string) => void
  on_delete: () => void
  on_edit: (values: EntryEditFormValues) => void
  on_move: (target_sheet_name: string) => void
  on_add_note: (text: string) => void
  on_edit_note: (timestamp: string, text: string) => void
}

/**
 * Full-width header region for the active sheet and running entry controls.
 */
export function TrackerActiveBar({
  active_sheet_name,
  active_entry,
  sheets,
  is_pending,
  on_check_out,
  on_delete,
  on_edit,
  on_move,
  on_add_note,
  on_edit_note,
}: TrackerActiveBarProps) {
  return (
    <div className="tracker-active-bar">
      <div className="tracker-active-bar__inner">
        <div className="tracker-active-bar__sheet-row">
          <span className="tracker-active-bar__label">Sheet</span>
          <span className="tracker-active-bar__sheet">{active_sheet_name}</span>
        </div>
        {active_entry !== null ? (
          <ActiveEntryPanel
            key={`${active_entry.sheetName}-${active_entry.id}`}
            entry={active_entry}
            sheets={sheets}
            in_bar
            is_pending={is_pending}
            on_check_out={on_check_out}
            on_delete={on_delete}
            on_edit={on_edit}
            on_move={on_move}
            on_add_note={on_add_note}
            on_edit_note={on_edit_note}
          />
        ) : (
          <p className="tracker-active-bar__idle">Not tracking</p>
        )}
      </div>
    </div>
  )
}
