'use client'

import { type FormEvent, useState } from 'react'

import { SheetActionsMenu } from '@/components/sheet-actions-menu'
import { type SerializedSheet } from '@/lib/types/tracker_state'

interface SheetSidebarProps {
  sheets: SerializedSheet[]
  db_path: string
  on_select: (name: string) => void
  on_create: (name: string) => void
  on_rename: (name: string, new_name: string) => void
  is_pending: boolean
}

/**
 * Lists sheets and supports switching, renaming, or creating new ones.
 */
export function SheetSidebar({
  sheets,
  db_path,
  on_select,
  on_create,
  on_rename,
  is_pending,
}: SheetSidebarProps) {
  const [new_sheet_name, set_new_sheet_name] = useState('')
  const [editing_sheet_name, set_editing_sheet_name] = useState<string | null>(
    null,
  )
  const [edited_sheet_name, set_edited_sheet_name] = useState('')

  const handle_create = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = new_sheet_name.trim()

    if (trimmed.length === 0) {
      return
    }

    on_create(trimmed)
    set_new_sheet_name('')
  }

  const start_rename = (sheet_name: string): void => {
    set_editing_sheet_name(sheet_name)
    set_edited_sheet_name(sheet_name)
  }

  const cancel_rename = (): void => {
    set_editing_sheet_name(null)
    set_edited_sheet_name('')
  }

  const handle_rename = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (editing_sheet_name === null) {
      return
    }

    const trimmed = edited_sheet_name.trim()

    if (trimmed.length === 0 || trimmed === editing_sheet_name) {
      cancel_rename()
      return
    }

    on_rename(editing_sheet_name, trimmed)
    cancel_rename()
  }

  return (
    <aside className="sheet-sidebar">
      <h2 className="sheet-sidebar__title">Sheets</h2>
      <ul className="sheet-list">
        {sheets.map((sheet) => (
          <li key={sheet.name} className="sheet-list__item">
            {editing_sheet_name === sheet.name ? (
              <form className="sheet-list__edit" onSubmit={handle_rename}>
                <input
                  className="input input--compact"
                  value={edited_sheet_name}
                  onChange={(event) => set_edited_sheet_name(event.target.value)}
                  disabled={is_pending}
                  autoFocus
                />
                <div className="sheet-list__edit-actions">
                  <button
                    type="submit"
                    className="button button--ghost"
                    disabled={
                      is_pending || edited_sheet_name.trim().length === 0
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    disabled={is_pending}
                    onClick={cancel_rename}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="sheet-list__row">
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
                    {sheet.hasActiveEntry
                      ? '● active'
                      : `${sheet.entryCount} entries`}
                  </span>
                </button>
                <SheetActionsMenu
                  sheet_name={sheet.name}
                  is_pending={is_pending}
                  on_rename={() => start_rename(sheet.name)}
                />
              </div>
            )}
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
      <p className="sheet-sidebar__path" title={db_path}>
        {db_path}
      </p>
    </aside>
  )
}
