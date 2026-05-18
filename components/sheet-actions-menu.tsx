'use client'

import { useEffect, useRef, useState } from 'react'

import { HamburgerIcon } from '@/components/hamburger-icon'

interface SheetActionsMenuProps {
  sheet_name: string
  is_pending: boolean
  on_rename: () => void
}

/**
 * Hamburger menu for sheet actions such as rename.
 */
export function SheetActionsMenu({
  sheet_name,
  is_pending,
  on_rename,
}: SheetActionsMenuProps) {
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
    <div className="entry-actions-menu sheet-list__menu" ref={menu_ref}>
      <button
        type="button"
        className="entry-actions-menu__button"
        aria-label={`Actions for sheet ${sheet_name}`}
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
                on_rename()
              }}
            >
              Rename
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
