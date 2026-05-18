'use client'

import { useEffect, useState } from 'react'

import { CheckoutButtonGroup } from '@/components/checkout-button-group'
import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { EntryActionsMenu } from '@/components/entry-actions-menu'
import { EntryEditForm, type EntryEditFormValues } from '@/components/entry-edit-form'
import { EntryNotesList } from '@/components/entry-notes-list'
import { NoteForm } from '@/components/note-form'
import { format_display_tag } from '@/lib/format_display_tag'
import { format_duration } from '@/lib/format_duration'
import { use_confirm_destructive_actions } from '@/lib/use_confirm_destructive_actions'
import { use_duration_format } from '@/lib/use_duration_format'
import { use_timer_show_seconds } from '@/lib/use_timer_show_seconds'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_delete_entry_confirm_dialog } from '@/lib/get_delete_entry_confirm_dialog'
import { get_delete_note_confirm_dialog } from '@/lib/get_delete_note_confirm_dialog'
import { get_active_panel_class_name } from '@/lib/get_active_panel_class_name'
import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

interface ActiveEntryPanelProps {
  entry: SerializedEntry
  sheets: SerializedSheet[]
  in_bar?: boolean
  on_check_out: (at?: string) => void
  on_delete: () => void
  on_edit: (values: EntryEditFormValues) => void
  on_move: (target_sheet_name: string) => void
  on_add_note: (text: string) => void
  on_edit_note: (timestamp: string, text: string) => void
  on_delete_note: (timestamp: string) => void
  is_pending: boolean
}

const tag_item_class =
  'rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text'

/**
 * Shows the running active entry with a live duration timer.
 */
export function ActiveEntryPanel({
  entry,
  sheets,
  in_bar = false,
  on_check_out,
  on_delete,
  on_edit,
  on_move,
  on_add_note,
  on_edit_note,
  on_delete_note,
  is_pending,
}: ActiveEntryPanelProps) {
  const { confirm } = use_confirm_dialog()
  const confirm_destructive_actions = use_confirm_destructive_actions()
  const duration_format = use_duration_format()
  const show_seconds = use_timer_show_seconds()
  const [duration_ms, set_duration_ms] = useState(entry.durationMs)
  const [is_editing, set_is_editing] = useState(false)
  const [is_adding_note, set_is_adding_note] = useState(false)

  useEffect(() => {
    set_is_adding_note(false)
  }, [entry.id, entry.sheetName])

  useEffect(() => {
    set_duration_ms(entry.durationMs)

    const interval = window.setInterval(() => {
      set_duration_ms(Date.now() - new Date(entry.start).getTime())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [entry.durationMs, entry.start])

  const panel_class = get_active_panel_class_name(in_bar, is_editing)

  const handle_delete_note = async (timestamp: string): Promise<void> => {
    const note = entry.notes.find((item) => item.timestamp === timestamp)
    const confirmed = confirm_destructive_actions
      ? await confirm(get_delete_note_confirm_dialog(note?.text ?? ''))
      : true

    if (confirmed) {
      on_delete_note(timestamp)
    }
  }

  if (is_editing) {
    return (
      <section className={panel_class}>
        <EntryEditForm
          entry={entry}
          is_pending={is_pending}
          in_active_panel
          on_cancel={() => set_is_editing(false)}
          on_save={(values) => {
            on_edit(values)
            set_is_editing(false)
          }}
        />
      </section>
    )
  }

  return (
    <section className={panel_class}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          {!in_bar ? (
            <span className="self-start rounded-full bg-accent px-2 py-0.5 text-[0.68rem] font-bold uppercase leading-none tracking-wider text-accent-text-on">
              Tracking
            </span>
          ) : null}
          <h2 className="m-0 text-xl font-[650] leading-tight tracking-tight">
            {entry.description || 'Untitled entry'}
          </h2>
        </div>
        <EntryActionsMenu
          current_sheet_name={entry.sheetName}
          sheets={sheets}
          is_pending={is_pending}
          on_edit={() => set_is_editing(true)}
          on_show_add_note_form={() => set_is_adding_note(true)}
          on_move={on_move}
          on_delete={async () => {
            const confirmed = confirm_destructive_actions
              ? await confirm(get_delete_entry_confirm_dialog(entry))
              : true

            if (confirmed) {
              on_delete()
            }
          }}
        />
      </div>
      <div className="flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-stretch">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="m-0 font-mono text-[2rem] font-medium leading-none tracking-tight text-accent">
            {format_duration(duration_ms, duration_format, show_seconds)}
          </p>
          {entry.tags.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {entry.tags.map((tag) => (
                <li key={tag} className={tag_item_class}>
                  {format_display_tag(tag)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div
          className={`inline-flex shrink-0 items-center gap-2 ${in_bar ? 'min-w-0 max-[860px]:w-full max-[860px]:justify-end' : 'min-w-30 max-[860px]:w-full max-[860px]:justify-stretch'}`}
        >
          {!is_adding_note ? (
            <button
              type="button"
              className={`${get_button_class_name('ghost')} max-[860px]:flex-1`}
              disabled={is_pending}
              onClick={() => set_is_adding_note(true)}
            >
              Add note
            </button>
          ) : null}
          <CheckoutButtonGroup
            in_bar={in_bar}
            is_pending={is_pending}
            on_check_out={on_check_out}
          />
        </div>
      </div>
      <EntryNotesList
        notes={entry.notes}
        variant="panel"
        in_bar={in_bar}
        is_pending={is_pending}
        on_edit_note={on_edit_note}
        on_delete_note={handle_delete_note}
      />
      {is_adding_note ? (
        <NoteForm
          in_active_panel
          in_bar={in_bar}
          is_pending={is_pending}
          on_cancel={() => set_is_adding_note(false)}
          on_submit={(text) => {
            on_add_note(text)
            set_is_adding_note(false)
          }}
        />
      ) : null}
    </section>
  )
}
