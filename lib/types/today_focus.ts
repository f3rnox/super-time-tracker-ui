import {
  type SerializedEntry,
  type SerializedSheet,
} from '@/lib/types/tracker_state'

/**
 * Serialized entry with duration clipped to the current calendar day.
 */
export interface TodayFocusEntry extends SerializedEntry {
  todayDurationMs: number
}

/**
 * Server payload for the today / focus page.
 */
export interface TodayFocusPageData {
  runningEntries: SerializedEntry[]
  todayEntries: TodayFocusEntry[]
  todayTotalMs: number
  sheetNames: string[]
  sheets: SerializedSheet[]
  knownTags: string[]
}
