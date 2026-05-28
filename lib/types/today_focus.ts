import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";
import { type FocusNudgesStatus } from "@/lib/types/focus_nudges_status";

/**
 * Serialized entry with duration clipped to the current calendar day.
 */
export interface TodayFocusEntry extends SerializedEntry {
  todayDurationMs: number;
}

/**
 * Server payload for the today / focus page.
 */
export interface TodayFocusPageData {
  runningEntries: SerializedEntry[];
  todayEntries: TodayFocusEntry[];
  todayTotalMs: number;
  focusStatus: FocusNudgesStatus;
  startDaySuggestions: TodayStartDaySuggestion[];
  sheetNames: string[];
  sheets: SerializedSheet[];
  knownTags: string[];
}

/**
 * Suggested first task for a sheet based on yesterday's latest entry.
 */
export interface TodayStartDaySuggestion {
  sheetName: string;
  suggestedDescription: string;
  suggestedTags: string[];
  lastLoggedAt: string;
}
