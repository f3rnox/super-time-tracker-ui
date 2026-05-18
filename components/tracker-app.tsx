'use client'

import { useState } from 'react'

import { ActiveEntryPanel } from '@/components/active-entry-panel'
import { CheckInForm } from '@/components/check-in-form'
import { EntryList } from '@/components/entry-list'
import { SheetSidebar } from '@/components/sheet-sidebar'
import { ThemeSwitcher } from '@/components/theme_switcher'
import { patch_tracker_action } from '@/lib/patch_tracker_action'
import { post_tracker_action } from '@/lib/post_tracker_action'
import { type EntryEditFormValues } from '@/components/entry-edit-form'
import { type TrackerState } from '@/lib/types/tracker_state'

interface TrackerAppProps {
  initial_state: TrackerState
}

/**
 * Main client application for the super-time-tracker web UI.
 */
export function TrackerApp({ initial_state }: TrackerAppProps) {
  const [state, set_state] = useState<TrackerState>(initial_state)
  const [error, set_error] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)

  const run_action = async (
    action: () => Promise<TrackerState>,
  ): Promise<void> => {
    set_is_pending(true)
    set_error(null)

    try {
      const next_state = await action()
      set_state(next_state)
    } catch (action_error: unknown) {
      set_error(
        action_error instanceof Error
          ? action_error.message
          : String(action_error),
      )
    } finally {
      set_is_pending(false)
    }
  }

  const active_sheet =
    state.sheets.find((sheet) => sheet.isActive)?.name ?? 'main'

  const edit_entry = (
    sheet_name: string,
    entry_id: number,
    values: EntryEditFormValues,
  ): Promise<TrackerState> =>
    patch_tracker_action('/api/entry', {
      sheetName: sheet_name,
      entryId: entry_id,
      ...values,
    })

  return (
    <div className="tracker-layout">
      <header className="tracker-header">
        <div>
          <p className="tracker-header__eyebrow">super-time-tracker</p>
          <h1 className="tracker-header__title">Time sheets</h1>
        </div>
        <div className="tracker-header__actions">
          <p className="tracker-header__path" title={state.dbPath}>
            {state.dbPath}
          </p>
          <ThemeSwitcher />
        </div>
      </header>

      {error !== null ? <p className="banner banner--error">{error}</p> : null}

      <div className="tracker-grid">
        <SheetSidebar
          sheets={state.sheets}
          is_pending={is_pending}
          on_select={(name) =>
            run_action(() => post_tracker_action('/api/sheet', { name }))
          }
          on_create={(name) =>
            run_action(() => post_tracker_action('/api/sheet', { name }))
          }
          on_rename={(name, new_name) =>
            run_action(() =>
              patch_tracker_action('/api/sheet', { name, newName: new_name }),
            )
          }
        />

        <main className="tracker-main">
          <p className="tracker-main__sheet-label">
            Active sheet: <strong>{active_sheet}</strong>
          </p>

          {state.activeEntry !== null ? (
            <ActiveEntryPanel
              key={`${state.activeEntry.sheetName}-${state.activeEntry.id}`}
              entry={state.activeEntry}
              sheets={state.sheets}
              is_pending={is_pending}
              on_check_out={() =>
                run_action(() => post_tracker_action('/api/out', {}))
              }
              on_delete={() =>
                run_action(() =>
                  post_tracker_action('/api/entry', {
                    sheetName: state.activeEntry?.sheetName,
                    entryId: state.activeEntry?.id,
                  }),
                )
              }
              on_edit={(values) =>
                run_action(() =>
                  edit_entry(
                    state.activeEntry?.sheetName ?? active_sheet,
                    state.activeEntry?.id ?? 0,
                    values,
                  ),
                )
              }
              on_move={(target_sheet_name) =>
                run_action(() =>
                  post_tracker_action('/api/entry/move', {
                    sheetName: state.activeEntry?.sheetName,
                    entryId: state.activeEntry?.id,
                    targetSheetName: target_sheet_name,
                  }),
                )
              }
              on_add_note={(text) =>
                run_action(() => post_tracker_action('/api/note', { text }))
              }
            />
          ) : (
            <CheckInForm
              is_pending={is_pending}
              on_submit={(values) =>
                run_action(() => post_tracker_action('/api/in', values))
              }
            />
          )}

          <EntryList
            title="Entries"
            entries={state.activeSheetEntries}
            sheets={state.sheets}
            total_ms={state.activeSheetTotalMs}
            empty_message={`No entries on sheet "${active_sheet}".`}
            is_pending={is_pending}
            show_sheet_name={false}
            on_delete={(entry) =>
              run_action(() =>
                post_tracker_action('/api/entry', {
                  sheetName: entry.sheetName,
                  entryId: entry.id,
                }),
              )
            }
            on_edit={(entry, values) =>
              run_action(() => edit_entry(entry.sheetName, entry.id, values))
            }
            on_move={(entry, target_sheet_name) =>
              run_action(() =>
                post_tracker_action('/api/entry/move', {
                  sheetName: entry.sheetName,
                  entryId: entry.id,
                  targetSheetName: target_sheet_name,
                }),
              )
            }
            on_move_many={(entries, target_sheet_name) =>
              run_action(() =>
                post_tracker_action('/api/entry/move-bulk', {
                  entries: entries.map((entry) => ({
                    sheetName: entry.sheetName,
                    entryId: entry.id,
                  })),
                  targetSheetName: target_sheet_name,
                }),
              )
            }
          />
        </main>
      </div>
    </div>
  )
}
