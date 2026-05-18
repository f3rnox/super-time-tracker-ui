'use client'

import { useEffect, useRef, useState } from 'react'

interface ActiveEntryActionsMenuProps {
  is_pending: boolean
  on_edit: () => void
  on_delete: () => void
}

/**
 * Hamburger menu for active entry edit and delete actions.
 */
export function ActiveEntryActionsMenu({
  is_pending,
  on_edit,
  on_delete,
}: ActiveEntryActionsMenuProps) {
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
