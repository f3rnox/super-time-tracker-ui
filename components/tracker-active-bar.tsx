'use client'

import { ActiveEntryPanel } from '@/components/active-entry-panel'
import { ActiveEntryNavButtons } from '@/components/active-entry-panel-nav'
import { type EntryEditFormValues } from '@/components/entry-edit-form'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface TrackerActiveBarProps {
  active_entry: SerializedEntry | null
  running_entry_count: number
  sheets: SerializedSheet[]
  is_pending: boolean
  on_show_previous_running_entry: () => void
  on_show_next_running_entry: () => void
  on_check_out: (at?: string) => void
  on_delete: () => void
  on_edit: (values: EntryEditFormValues) => void
  on_move: (target_sheet_name: string) => void
  on_add_note: (text: string) => void
  on_edit_note: (timestamp: string, text: string) => void
  on_delete_note: (timestamp: string) => void
}

const section_label_class =
  'text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted whitespace-nowrap'

const tracking_pill_class =
  'shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.68rem] font-bold uppercase leading-none tracking-wider text-accent-text-on'

/**
 * Full-width header region for the active sheet and running entry controls.
 */
export function TrackerActiveBar({
  active_entry,
  running_entry_count,
  sheets,
  is_pending,
  on_show_previous_running_entry,
  on_show_next_running_entry,
  on_check_out,
  on_delete,
  on_edit,
  on_move,
  on_add_note,
  on_edit_note,
  on_delete_note,
}: TrackerActiveBarProps) {
  const show_running_entry_nav = running_entry_count > 1

  return (
    <div className="w-full border-b border-panel-border bg-[color-mix(in_srgb,var(--accent-soft)_55%,var(--panel))]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-3 px-5 py-3.5 max-[860px]:gap-2.5 max-[860px]:py-3">
        {active_entry !== null ? (
          <div className="flex flex-col gap-2">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className={`${section_label_class} truncate`}>
                  Sheet {active_entry.sheetName}
                </span>
                <span className={tracking_pill_class}>Tracking</span>
              </div>
              {show_running_entry_nav ? (
                <ActiveEntryNavButtons
                  is_pending={is_pending}
                  on_previous={on_show_previous_running_entry}
                  on_next={on_show_next_running_entry}
                />
              ) : null}
            </div>
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
              on_delete_note={on_delete_note}
            />
          </div>
        ) : (
          <p className="m-0 text-[0.85rem] leading-tight text-muted">Not tracking</p>
        )}
      </div>
    </div>
  )
}
