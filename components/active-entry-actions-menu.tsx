'use client'

import { useEffect, useRef, useState } from 'react'

import { type SerializedSheet } from '@/lib/types/tracker_state'

interface ActiveEntryActionsMenuProps {
  current_sheet_name: string
  sheets: SerializedSheet[]
  is_pending: boolean
  on_edit: () => void
  on_delete: () => void
  on_move: (target_sheet_name: string) => void
}

/**
 * Hamburger menu for active entry edit, move, and delete actions.
 */
export function ActiveEntryActionsMenu({
  current_sheet_name,
  sheets,
  is_pending,
  on_edit,
  on_delete,
  on_move,
}: ActiveEntryActionsMenuProps) {
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
    <div className="active-panel__menu" ref={menu_ref}>
      <button
        type="button"
        className="active-panel__menu-button"
        aria-label="Entry actions"
        aria-expanded={is_open}
        aria-haspopup="menu"
        disabled={is_pending}
        onClick={() => set_is_open((open) => !open)}
      >
        <span className="active-panel__menu-icon" aria-hidden="true" />
      </button>
      {is_open ? (
        <ul className="active-panel__menu-dropdown" role="menu">
          <li role="none">
            <button
              type="button"
              className="active-panel__menu-item"
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
          <li
            className="active-panel__menu-separator"
            role="separator"
            aria-hidden="true"
          />
          <li role="none">
            <p className="active-panel__menu-heading">Move to sheet</p>
          </li>
          {other_sheets.length === 0 ? (
            <li role="none">
              <button
                type="button"
                className="active-panel__menu-item"
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
                  className="active-panel__menu-item active-panel__menu-item--nested"
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
            className="active-panel__menu-separator"
            role="separator"
            aria-hidden="true"
          />
          <li role="none">
            <button
              type="button"
              className="active-panel__menu-item active-panel__menu-item--danger"
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
