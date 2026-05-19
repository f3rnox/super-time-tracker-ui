'use client'

import { type MouseEvent, type ReactNode, useState } from 'react'

import { ChevronIcon } from '@/components/chevron-icon'
import { format_time } from '@/components/format_time'
import { NoteEditForm } from '@/components/note-edit-form'
import { PencilIcon } from '@/components/pencil-icon'
import { TrashIcon } from '@/components/trash-icon'
import { use_time_format } from '@/lib/use_time_format'
import { type SerializedNote } from '@/lib/types/tracker_state'

type EntryNotesListVariant = 'panel' | 'inline'

interface EntryNotesListProps {
  notes: SerializedNote[]
  variant?: EntryNotesListVariant
  in_bar?: boolean
  is_pending?: boolean
  on_edit_note?: (timestamp: string, text: string) => void
  on_delete_note?: (timestamp: string) => void
}

const edit_button_class =
  'inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[0.35rem] border-0 bg-transparent p-0 text-muted hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-55'

/**
 * Renders notes attached to a time sheet entry.
 */
export function EntryNotesList({
  notes,
  variant = 'panel',
  in_bar = false,
  is_pending = false,
  on_edit_note,
  on_delete_note,
}: EntryNotesListProps) {
  const time_format = use_time_format()
  const [editing_timestamp, set_editing_timestamp] = useState<string | null>(
    null,
  )
  const [is_expanded, set_is_expanded] = useState(variant === 'panel')

  if (notes.length === 0) {
    return null
  }

  const sorted_notes = [...notes].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  )

  const is_inline = variant === 'inline'
  const is_panel_in_bar = variant === 'panel' && in_bar
  const is_list_visible =
    is_panel_in_bar || is_expanded || editing_timestamp !== null
  const toggle_label = is_inline
    ? `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`
    : `Notes (${notes.length})`

  const root_class = [
    is_inline ? 'm-0 w-full p-0' : 'border-t border-accent-border pt-3.5',
    in_bar && !is_inline
      ? 'border-[color-mix(in_srgb,var(--accent-border)_65%,var(--panel-border))]'
      : '',
    is_panel_in_bar ? 'flex min-h-0 flex-1 flex-col' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const toggle_class = is_inline
    ? 'inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-inherit text-xs font-medium normal-case tracking-normal text-muted hover:text-foreground'
    : 'inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 py-0.5 font-inherit text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted hover:text-foreground'

  const list_visibility_class = is_list_visible
    ? is_panel_in_bar
      ? ''
      : 'mt-1.5'
    : 'hidden'

  const list_class = is_inline
    ? `m-0 flex list-none flex-col gap-1.5 overflow-visible p-0 compact:gap-0.5 ${list_visibility_class}`
    : is_panel_in_bar
      ? `m-0 grid min-h-0 flex-1 list-none auto-rows-fr grid-cols-2 gap-2 p-0 max-[860px]:grid-cols-1 ${list_visibility_class}`
      : `m-0 grid list-none grid-cols-2 gap-2 p-0 max-[860px]:grid-cols-1 ${list_visibility_class}`

  const item_class = is_inline
    ? 'flex flex-col gap-0.5 rounded-sm border border-panel-border bg-ghost-bg px-2 py-1.5 compact:rounded-none compact:px-1.5 compact:py-1'
    : is_panel_in_bar
      ? 'flex min-h-0 flex-col justify-center gap-0.5 rounded-sm border border-panel-border bg-[color-mix(in_srgb,var(--panel)_55%,var(--background))] px-2.5 py-2'
      : 'flex flex-col gap-0.5 rounded-sm border border-panel-border bg-[color-mix(in_srgb,var(--panel)_55%,var(--background))] px-2.5 py-2'

  const handle_save = (timestamp: string, text: string): void => {
    on_edit_note?.(timestamp, text)
    set_editing_timestamp(null)
  }

  const start_editing = (timestamp: string): void => {
    set_is_expanded(true)
    set_editing_timestamp(timestamp)
  }

  const handle_delete = (timestamp: string): void => {
    if (editing_timestamp === timestamp) {
      set_editing_timestamp(null)
    }

    on_delete_note?.(timestamp)
  }

  const render_note_actions = (note: SerializedNote): ReactNode => {
    if (on_edit_note === undefined && on_delete_note === undefined) {
      return null
    }

    return (
      <div className="flex shrink-0 gap-0.5">
        {on_edit_note !== undefined ? (
          <button
            type="button"
            className={edit_button_class}
            aria-label="Edit note"
            title="Edit note"
            disabled={is_pending}
            onClick={(event) => {
              event.stopPropagation()
              start_editing(note.timestamp)
            }}
          >
            <PencilIcon />
          </button>
        ) : null}
        {on_delete_note !== undefined ? (
          <button
            type="button"
            className={`${edit_button_class} hover:text-danger`}
            aria-label="Delete note"
            title="Delete note"
            disabled={is_pending}
            onClick={(event) => {
              event.stopPropagation()
              handle_delete(note.timestamp)
            }}
          >
            <TrashIcon />
          </button>
        ) : null}
      </div>
    )
  }

  const handle_toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()

    if (editing_timestamp !== null) {
      return
    }

    set_is_expanded((previous) => !previous)
  }

  return (
    <section className={root_class} aria-label="Entry notes">
      {is_panel_in_bar ? null : (
        <button
          type="button"
          className={toggle_class}
          aria-expanded={is_list_visible}
          onClick={handle_toggle}
        >
          <ChevronIcon rotated={is_list_visible} />
          <span>{toggle_label}</span>
        </button>
      )}
      <ul className={list_class}>
        {sorted_notes.map((note, index) => {
          const is_editing = editing_timestamp === note.timestamp

          return (
            <li key={`${note.timestamp}-${index}`} className={item_class}>
              {is_editing ? (
                <NoteEditForm
                  initial_text={note.text}
                  inline={is_inline}
                  is_pending={is_pending}
                  on_cancel={() => set_editing_timestamp(null)}
                  on_save={(text) => handle_save(note.timestamp, text)}
                />
              ) : is_inline ? (
                <div className="flex w-full items-start justify-between gap-1.5">
                  <p className="m-0 flex min-w-0 flex-1 items-baseline gap-1.5 text-xs leading-snug text-foreground compact:text-[0.72rem]">
                    <time
                      className="shrink-0 font-mono text-[0.68rem] text-muted"
                      dateTime={note.timestamp}
                    >
                      {format_time(note.timestamp, time_format)}
                    </time>
                    <span className="min-w-0 overflow-wrap-anywhere whitespace-pre-wrap">
                      {note.text}
                    </span>
                  </p>
                  {render_note_actions(note)}
                </div>
              ) : (
                <>
                  <div className="flex w-full items-start justify-between gap-1.5">
                    <time
                      className="font-mono text-[0.72rem] text-muted"
                      dateTime={note.timestamp}
                    >
                      {format_time(note.timestamp, time_format)}
                    </time>
                    {render_note_actions(note)}
                  </div>
                  <p className="m-0 overflow-wrap-anywhere text-[0.9rem] leading-snug whitespace-pre-wrap">
                    {note.text}
                  </p>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
