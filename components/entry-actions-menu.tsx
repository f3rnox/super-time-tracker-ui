'use client'

import { useEffect, useRef, useState } from 'react'

import { HamburgerIcon } from '@/components/hamburger-icon'
import { prompt_entry_note } from '@/lib/prompt_entry_note'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'
import { type SerializedSheet } from '@/lib/types/tracker_state'

interface EntryActionsMenuProps {
  current_sheet_name: string
  sheets: SerializedSheet[]
  is_pending: boolean
  on_edit: () => void
  on_add_note?: (text: string) => void
  on_show_add_note_form?: () => void
  on_revise_description_ai?: () => void
  can_revise_description_ai?: boolean
  on_resume?: () => void
  entry_is_active?: boolean
  on_delete: () => void
  on_move: (target_sheet_name: string) => void
}

const menu_item_class =
  'block w-full cursor-pointer rounded-[0.45rem] border-0 bg-transparent px-2.5 py-1.5 text-left font-inherit text-[0.85rem] text-inherit hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-55'

/**
 * Hamburger menu for entry edit, move, and delete actions.
 */
export function EntryActionsMenu({
  current_sheet_name,
  sheets,
  is_pending,
  on_edit,
  on_add_note,
  on_show_add_note_form,
  on_revise_description_ai,
  can_revise_description_ai = false,
  on_resume,
  entry_is_active = false,
  on_delete,
  on_move,
}: EntryActionsMenuProps) {
  const current_sheet = sheets.find((sheet) => sheet.name === current_sheet_name)
  const resume_blocked =
    entry_is_active ||
    (current_sheet?.hasActiveEntry === true && !entry_is_active)
  const resume_blocked_reason = entry_is_active
    ? 'This entry is already active'
    : 'Another entry is active on this sheet'
  const other_sheets = sheets.filter(
    (sheet) => sheet.name !== current_sheet_name,
  )
  const [is_open, set_is_open] = useState(false)
  const menu_ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!is_open) {
      return
    }

    const handle_pointer_down = (event: PointerEvent): void => {
      if (
        menu_ref.current !== null &&
        !menu_ref.current.contains(event.target as Node)
      ) {
        set_is_open(false)
      }
    }

    document.addEventListener('pointerdown', handle_pointer_down)

    return () => {
      document.removeEventListener('pointerdown', handle_pointer_down)
    }
  }, [is_open])

  const close_menu = (): void => {
    set_is_open(false)
  }

  use_escape_to_cancel(close_menu, is_open)

  return (
    <div className="relative shrink-0" ref={menu_ref}>
      <button
        type="button"
        className="inline-flex cursor-pointer appearance-none items-center justify-center rounded-none border-0 bg-transparent p-0.5 text-muted shadow-none hover:opacity-75 focus-visible:outline-2 focus-visible:outline-input-focus-border focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
        aria-label="Entry actions"
        aria-expanded={is_open}
        aria-haspopup="menu"
        disabled={is_pending}
        onClick={() => set_is_open((open) => !open)}
      >
        <HamburgerIcon />
      </button>
      {is_open ? (
        <ul
          className="absolute right-0 top-full z-10 mt-1.5 min-w-56 list-none rounded-md border border-panel-border bg-panel p-1.5 shadow-md"
          role="menu"
        >
          <li role="none">
            <button
              type="button"
              className={menu_item_class}
              role="menuitem"
              disabled={is_pending}
              onClick={() => {
                close_menu()
                on_edit()
              }}
            >
              Edit times
            </button>
          </li>
          {on_show_add_note_form !== undefined || on_add_note !== undefined ? (
            <li role="none">
              <button
                type="button"
                className={menu_item_class}
                role="menuitem"
                disabled={is_pending}
                onClick={() => {
                  close_menu()

                  if (on_show_add_note_form !== undefined) {
                    on_show_add_note_form()
                    return
                  }

                  const text = prompt_entry_note()

                  if (text !== null && on_add_note !== undefined) {
                    on_add_note(text)
                  }
                }}
              >
                Add note
              </button>
            </li>
          ) : null}
          {on_revise_description_ai !== undefined ? (
            <li role="none">
              <button
                type="button"
                className={menu_item_class}
                role="menuitem"
                disabled={is_pending || !can_revise_description_ai}
                title={
                  can_revise_description_ai
                    ? 'Revise with AI'
                    : 'Configure provider and key in Settings → AI suggestions'
                }
                onClick={() => {
                  close_menu()
                  on_revise_description_ai()
                }}
              >
                Revise description with AI
              </button>
            </li>
          ) : null}
          {on_resume !== undefined ? (
            <li role="none">
              <button
                type="button"
                className={menu_item_class}
                role="menuitem"
                disabled={is_pending || resume_blocked}
                title={resume_blocked ? resume_blocked_reason : undefined}
                onClick={() => {
                  close_menu()
                  on_resume()
                }}
              >
                Resume
              </button>
            </li>
          ) : null}
          <li className="my-1 border-t border-panel-border" role="separator" aria-hidden="true" />
          <li role="none">
            <p className="m-0 px-2.5 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
              Move to sheet
            </p>
          </li>
          {other_sheets.length === 0 ? (
            <li role="none">
              <button type="button" className={menu_item_class} role="menuitem" disabled>
                No other sheets
              </button>
            </li>
          ) : (
            other_sheets.map((sheet) => (
              <li key={sheet.name} role="none">
                <button
                  type="button"
                  className={`${menu_item_class} pl-4`}
                  role="menuitem"
                  disabled={is_pending || sheet.hasActiveEntry}
                  title={
                    sheet.hasActiveEntry
                      ? 'That sheet already has an active entry'
                      : undefined
                  }
                  onClick={() => {
                    close_menu()
                    on_move(sheet.name)
                  }}
                >
                  {sheet.name}
                </button>
              </li>
            ))
          )}
          <li className="my-1 border-t border-panel-border" role="separator" aria-hidden="true" />
          <li role="none">
            <button
              type="button"
              className={`${menu_item_class} text-danger`}
              role="menuitem"
              disabled={is_pending}
              onClick={() => {
                close_menu()
                on_delete()
              }}
            >
              Delete
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
