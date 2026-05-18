'use client'

import { useEffect, useRef, useState } from 'react'

import { HamburgerIcon } from '@/components/hamburger-icon'
import { prompt_entry_note } from '@/lib/prompt_entry_note'
import { type SerializedSheet } from '@/lib/types/tracker_state'

interface EntryActionsMenuProps {
  current_sheet_name: string
  sheets: SerializedSheet[]
  is_pending: boolean
  on_edit: () => void
  on_add_note?: (text: string) => void
  on_resume?: () => void
  entry_is_active?: boolean
  on_delete: () => void
  on_move: (target_sheet_name: string) => void
}

/**
 * Hamburger menu for entry edit, move, and delete actions.
 */
export function EntryActionsMenu({
  current_sheet_name,
  sheets,
  is_pending,
  on_edit,
  on_add_note,
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

  return (
    <div className="entry-actions-menu" ref={menu_ref}>
      <button
        type="button"
        className="entry-actions-menu__button"
        aria-label="Entry actions"
        aria-expanded={is_open}
        aria-haspopup="menu"
        disabled={is_pending}
        onClick={() => set_is_open((open) => !open)}
      >
        <HamburgerIcon />
      </button>
      {is_open ? (
        <ul className="entry-actions-menu__dropdown" role="menu">
          <li role="none">
            <button
              type="button"
              className="entry-actions-menu__item"
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
          {on_add_note !== undefined ? (
            <li role="none">
              <button
                type="button"
                className="entry-actions-menu__item"
                role="menuitem"
                disabled={is_pending}
                onClick={() => {
                  close_menu()
                  const text = prompt_entry_note()

                  if (text !== null) {
                    on_add_note(text)
                  }
                }}
              >
                Add note
              </button>
            </li>
          ) : null}
          {on_resume !== undefined ? (
            <li role="none">
              <button
                type="button"
                className="entry-actions-menu__item"
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
          <li
            className="entry-actions-menu__separator"
            role="separator"
            aria-hidden="true"
          />
          <li role="none">
            <p className="entry-actions-menu__heading">Move to sheet</p>
          </li>
          {other_sheets.length === 0 ? (
            <li role="none">
              <button
                type="button"
                className="entry-actions-menu__item"
                role="menuitem"
                disabled
              >
                No other sheets
              </button>
            </li>
          ) : (
            other_sheets.map((sheet) => (
              <li key={sheet.name} role="none">
                <button
                  type="button"
                  className="entry-actions-menu__item entry-actions-menu__item--nested"
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
          <li
            className="entry-actions-menu__separator"
            role="separator"
            aria-hidden="true"
          />
          <li role="none">
            <button
              type="button"
              className="entry-actions-menu__item entry-actions-menu__item--danger"
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
