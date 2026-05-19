'use client'

import { forwardRef } from 'react'

import {
  ActiveEntryPanel,
  type ActiveEntryPanelHandle,
} from '@/components/active-entry-panel'
import { type EntryEditFormValues } from '@/components/entry-edit-form'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface TrackerActiveBarProps {
  active_entry: SerializedEntry | null
  sheets: SerializedSheet[]
  known_tags: string[]
  is_pending: boolean
  on_check_out: (at?: string) => void
  on_delete: () => void
  on_edit: (values: EntryEditFormValues) => void
  on_move: (target_sheet_name: string) => void
  on_add_note: (text: string, at?: string) => void
  on_edit_note: (timestamp: string, text: string) => void
  on_delete_note: (timestamp: string) => void
}

const section_label_class =
  'text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted whitespace-nowrap'

const tracking_pill_class =
  'shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.68rem] font-bold uppercase leading-none tracking-wider text-accent-text-on'

/**
 * Active entry display for the tracker content column.
 */
export const TrackerActiveBar = forwardRef<
  ActiveEntryPanelHandle,
  TrackerActiveBarProps
>(function TrackerActiveBar(
  {
    active_entry,
    sheets,
    known_tags,
    is_pending,
    on_check_out,
    on_delete,
    on_edit,
    on_move,
    on_add_note,
    on_edit_note,
    on_delete_note,
  },
  ref,
) {
  if (active_entry === null) {
    return null
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className={`${section_label_class} truncate`}>
          Sheet {active_entry.sheetName}
        </span>
        <span className={tracking_pill_class}>Tracking</span>
      </div>
      <ActiveEntryPanel
        ref={ref}
        key={`${active_entry.sheetName}-${active_entry.id}`}
        entry={active_entry}
        sheets={sheets}
        known_tags={known_tags}
        in_bar
        is_pending={is_pending}
        on_check_out={on_check_out}
        on_delete={on_delete}
        on_edit={on_edit}
        on_move={on_move}
        on_add_note={on_add_note}
        on_edit_note={on_edit_note}
        on_delete_note={on_delete_note}
      />
    </div>
  )
})
