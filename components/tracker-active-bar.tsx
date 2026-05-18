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
    <div className="w-full border-b border-panel-border bg-[color-mix(in_srgb,var(--accent-soft)_55%,var(--panel))]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-3 px-5 py-3.5 max-[860px]:gap-2.5 max-[860px]:py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted whitespace-nowrap">
            Viewing
          </span>
          <span className="truncate text-[0.95rem] font-[650] leading-tight">
            {active_sheet_name}
          </span>
          {active_entry !== null &&
          active_entry.sheetName !== active_sheet_name ? (
            <span className="text-[0.82rem] text-muted">
              (timer on {active_entry.sheetName})
            </span>
          ) : null}
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
          <p className="m-0 text-[0.85rem] leading-tight text-muted">Not tracking</p>
        )}
      </div>
    </div>
  )
}
