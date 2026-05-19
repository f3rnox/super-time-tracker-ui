'use client'

import { type FormEvent, useState } from 'react'

import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { SheetActionsMenu } from '@/components/sheet-actions-menu'
import { get_delete_sheet_confirm_dialog } from '@/lib/get_delete_sheet_confirm_dialog'
import { use_confirm_destructive_actions } from '@/lib/use_confirm_destructive_actions'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'
import { type SerializedSheet } from '@/lib/types/tracker_state'

interface SheetSidebarProps {
  sheets: SerializedSheet[]
  db_path: string
  on_select: (name: string) => void
  on_create: (name: string) => void
  on_rename: (name: string, new_name: string) => void
  on_delete: (name: string) => void
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
  on_delete,
  is_pending,
}: SheetSidebarProps) {
  const { confirm } = use_confirm_dialog()
  const confirm_destructive_actions = use_confirm_destructive_actions()
  const can_delete_sheet = sheets.length > 1
  const [is_adding_sheet, set_is_adding_sheet] = useState(false)
  const [new_sheet_name, set_new_sheet_name] = useState('')
  const [editing_sheet_name, set_editing_sheet_name] = useState<string | null>(
    null,
  )
  const [edited_sheet_name, set_edited_sheet_name] = useState('')

  const cancel_add_sheet = (): void => {
    set_is_adding_sheet(false)
    set_new_sheet_name('')
  }

  const handle_create = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = new_sheet_name.trim()

    if (trimmed.length === 0) {
      return
    }

    on_create(trimmed)
    cancel_add_sheet()
  }

  const start_rename = (sheet_name: string): void => {
    set_editing_sheet_name(sheet_name)
    set_edited_sheet_name(sheet_name)
  }

  const cancel_rename = (): void => {
    set_editing_sheet_name(null)
    set_edited_sheet_name('')
  }

  use_escape_to_cancel(cancel_rename, editing_sheet_name !== null)
  use_escape_to_cancel(cancel_add_sheet, is_adding_sheet)

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
    <aside className="flex min-w-0 flex-col gap-3 max-[860px]:min-w-0">
      <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        Sheets
      </h2>
      <ul className="m-0 flex min-h-0 flex-1 list-none flex-col gap-1.5 p-0">
        {sheets.map((sheet) => (
          <li key={sheet.name} className="min-w-0">
            {editing_sheet_name === sheet.name ? (
              <form className="flex w-full min-w-0 flex-col gap-1.5" onSubmit={handle_rename}>
                <input
                  className={get_input_class_name('compact')}
                  value={edited_sheet_name}
                  onChange={(event) => set_edited_sheet_name(event.target.value)}
                  disabled={is_pending}
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    className={`${get_button_class_name('ghost')} flex-1`}
                    disabled={
                      is_pending || edited_sheet_name.trim().length === 0
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={`${get_button_class_name('ghost')} flex-1`}
                    disabled={is_pending}
                    onClick={cancel_rename}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex min-w-0 items-stretch gap-1">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-md border border-transparent bg-transparent px-2.5 py-2 text-left transition-[background-color,color] duration-150 hover:bg-surface-hover"
                  disabled={is_pending && !sheet.isActive}
                  onClick={() => on_select(sheet.name)}
                >
                  <span
                    className={`min-w-0 flex-1 truncate font-semibold ${
                      sheet.isActive || sheet.hasActiveEntry ? 'text-accent' : ''
                    }`}
                  >
                    {sheet.name}
                  </span>
                  <span
                    className={`shrink-0 text-xs whitespace-nowrap ${
                      sheet.hasActiveEntry ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {sheet.hasActiveEntry
                      ? '● active'
                      : `${sheet.entryCount} entries`}
                  </span>
                </button>
                <SheetActionsMenu
                  sheet_name={sheet.name}
                  is_pending={is_pending}
                  can_delete={can_delete_sheet}
                  on_rename={() => start_rename(sheet.name)}
                  on_delete={async () => {
                    const confirmed = confirm_destructive_actions
                      ? await confirm(
                          get_delete_sheet_confirm_dialog(
                            sheet.name,
                            sheet.entryCount,
                            sheet.hasActiveEntry,
                          ),
                        )
                      : true

                    if (confirmed) {
                      on_delete(sheet.name)
                    }
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      {is_adding_sheet ? (
        <form
          className="flex w-full min-w-0 flex-col gap-2"
          onSubmit={handle_create}
        >
          <input
            className={get_input_class_name('compact')}
            value={new_sheet_name}
            onChange={(event) => set_new_sheet_name(event.target.value)}
            placeholder="New sheet name"
            disabled={is_pending}
            autoFocus
          />
          <div className="flex gap-1.5">
            <button
              type="submit"
              className={`${get_button_class_name('ghost')} flex-1`}
              disabled={is_pending || new_sheet_name.trim().length === 0}
            >
              Add
            </button>
            <button
              type="button"
              className={`${get_button_class_name('ghost')} flex-1`}
              disabled={is_pending}
              onClick={cancel_add_sheet}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className={get_button_class_name('ghost')}
          disabled={is_pending}
          onClick={() => set_is_adding_sheet(true)}
        >
          Add sheet
        </button>
      )}
      <p
        className="mt-auto shrink-0 overflow-wrap-anywhere border-t border-panel-border pt-3 font-mono text-[0.65rem] leading-snug text-muted"
        title={db_path}
      >
        {db_path}
      </p>
    </aside>
  )
}
