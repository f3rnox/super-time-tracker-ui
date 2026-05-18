'use client'

import { useState } from 'react'

import { ActiveEntryPanel } from '@/components/active-entry-panel'
import { CheckInForm } from '@/components/check-in-form'
import { EntryList } from '@/components/entry-list'
import { NoteForm } from '@/components/note-form'
import { SheetSidebar } from '@/components/sheet-sidebar'
import { post_tracker_action } from '@/lib/post_tracker_action'
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

  return (
    <div className="tracker-layout">
      <header className="tracker-header">
        <div>
          <p className="tracker-header__eyebrow">super-time-tracker</p>
          <h1 className="tracker-header__title">Time sheets</h1>
        </div>
        <p className="tracker-header__path" title={state.dbPath}>
          {state.dbPath}
        </p>
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
        />

        <main className="tracker-main">
          <p className="tracker-main__sheet-label">
            Active sheet: <strong>{active_sheet}</strong>
          </p>

          {state.activeEntry !== null ? (
            <>
              <ActiveEntryPanel
                key={`${state.activeEntry.sheetName}-${state.activeEntry.id}`}
                entry={state.activeEntry}
                is_pending={is_pending}
                on_check_out={() =>
                  run_action(() => post_tracker_action('/api/out', {}))
                }
              />
              <NoteForm
                is_pending={is_pending}
                on_submit={(text) =>
                  run_action(() => post_tracker_action('/api/note', { text }))
                }
              />
            </>
          ) : (
            <CheckInForm
              is_pending={is_pending}
              on_submit={(description) =>
                run_action(() =>
                  post_tracker_action('/api/in', { description }),
                )
              }
            />
          )}

          <EntryList entries={state.todayEntries} total_ms={state.todayTotalMs} />
        </main>
      </div>
    </div>
  )
}
