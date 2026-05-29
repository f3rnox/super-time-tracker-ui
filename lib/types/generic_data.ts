export interface ITimeSheetEntryNote<T> {
  timestamp: T;
  text: string;
}

export interface ITimeSheetEntry<T> {
  id: number;
  start: T;
  end: T | null;
  description: string;
  tags: string[];
  notes: ITimeSheetEntryNote<T>[];
  /** When true, hidden from tracker nav and entry lists. */
  archived?: boolean;
}

export interface ITimeSheetTask<T> {
  id: string;
  title: string;
  createdAt: T;
  updatedAt: T;
  completedAt: T | null;
}

export interface ITimeSheet<T> {
  name: string;
  entries: ITimeSheetEntry<T>[];
  tasks: ITimeSheetTask<T>[];
  activeEntryID: number | null;
  /** When true, hidden from hub and sheet sidebar. */
  archived?: boolean;
}

export interface ITimeTrackerDB<T> {
  sheets: ITimeSheet<T>[];
  activeSheetName: string | null;
  version: number;
}
