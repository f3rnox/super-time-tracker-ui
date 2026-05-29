import {
  type ITimeSheet,
  type ITimeSheetEntry,
  type ITimeSheetEntryNote,
  type ITimeSheetTask,
  type ITimeTrackerDB,
} from "./generic_data";

export type TimeTrackerDB = ITimeTrackerDB<Date>;
export type TimeSheetEntry = ITimeSheetEntry<Date>;
export type TimeSheetEntryNote = ITimeSheetEntryNote<Date>;
export type TimeSheetTask = ITimeSheetTask<Date>;
export type TimeSheet = ITimeSheet<Date>;

export type JSONTimeTrackerDB = ITimeTrackerDB<number>;
export type JSONTimeSheetEntry = ITimeSheetEntry<number>;
export type JSONTimeSheetEntryNote = ITimeSheetEntryNote<number>;
export type JSONTimeSheetTask = ITimeSheetTask<number>;
export type JSONTimeSheet = ITimeSheet<number>;
