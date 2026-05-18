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
  activeEntry: SerializedEntry | null;
  todayEntries: SerializedEntry[];
  todayTotalMs: number;
}
