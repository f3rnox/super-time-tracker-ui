import { write_active_sheet_preference } from '@/lib/write_active_sheet_preference'
import { type TrackerState } from '@/lib/types/tracker_state'

/**
 * Updates stored sheet preference from the current tracker state.
 */
export function sync_active_sheet_preference(state: TrackerState): void {
  if (typeof window === 'undefined') {
    return
  }

  const sheet_name = state.activeSheetName

  if (sheet_name === null) {
    return
  }

  write_active_sheet_preference(sheet_name)
}
