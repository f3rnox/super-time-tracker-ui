'use client'

import { type FormEvent, useState } from 'react'

import { type SerializedSheet } from '@/lib/types/tracker_state'

interface SheetSidebarProps {
  sheets: SerializedSheet[]
  on_select: (name: string) => void
  on_create: (name: string) => void
  is_pending: boolean
}

/**
 * Lists sheets and supports switching or creating new ones.
 */
export function SheetSidebar({
  sheets,
  on_select,
  on_create,
  is_pending,
}: SheetSidebarProps) {
  const [new_sheet_name, set_new_sheet_name] = useState('')

  const handle_create = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = new_sheet_name.trim()

    if (trimmed.length === 0) {
      return
    }

    on_create(trimmed)
    set_new_sheet_name('')
  }

  return (
    <aside className="sheet-sidebar">
      <h2 className="sheet-sidebar__title">Sheets</h2>
      <ul className="sheet-list">
        {sheets.map((sheet) => (
          <li key={sheet.name}>
            <button
              type="button"
              className={`sheet-list__button${
                sheet.isActive ? ' sheet-list__button--active' : ''
              }`}
              disabled={is_pending}
              onClick={() => on_select(sheet.name)}
            >
              <span className="sheet-list__name">{sheet.name}</span>
              <span className="sheet-list__meta">
                {sheet.hasActiveEntry ? '● active' : `${sheet.entryCount} entries`}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <form className="sheet-create" onSubmit={handle_create}>
        <input
          className="input input--compact"
          value={new_sheet_name}
          onChange={(event) => set_new_sheet_name(event.target.value)}
          placeholder="New sheet name"
          disabled={is_pending}
        />
        <button
          type="submit"
          className="button button--ghost"
          disabled={is_pending || new_sheet_name.trim().length === 0}
        >
          Add
        </button>
      </form>
    </aside>
  )
}
