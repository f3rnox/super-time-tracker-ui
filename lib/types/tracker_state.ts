import { type FocusNudgesStatus } from "@/lib/types/focus_nudges_status";

export interface SerializedNote {
  timestamp: string;
  text: string;
}

export interface SerializedEntry {
  id: number;
  description: string;
  start: string;
  end: string | null;
  tags: string[];
  notes: SerializedNote[];
  sheetName: string;
  durationMs: number;
  isActive: boolean;
}

export interface SerializedSheet {
  name: string;
  activeEntryID: number | null;
  entryCount: number;
  isActive: boolean;
  hasActiveEntry: boolean;
}

export interface TrackerState {
  dbPath: string;
  activeSheetName: string | null;
  sheets: SerializedSheet[];
  knownTags: string[];
  /** Running entry on the viewed sheet, if any. */
  activeEntry: SerializedEntry | null;
  /** Any running entry (for the header bar and tab title). */
  runningEntry: SerializedEntry | null;
  /** All running entries across sheets, in sheet order. */
  runningEntries: SerializedEntry[];
  activeSheetEntries: SerializedEntry[];
  activeSheetTotalMs: number;
  /** False when entries are loaded client-side after the shell renders. */
  activeSheetEntriesLoaded?: boolean;
  /** Global focus metrics from SSR; scoped metrics still load on the client. */
  focusNudgesStatusGlobal?: FocusNudgesStatus;
}
