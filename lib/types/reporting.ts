export type SheetReportSort =
  | "duration"
  | "name"
  | "entry_count"
  | "active_first";

export interface ReportingDateRangeInputs {
  from_date: string;
  to_date: string;
}

export type ReportingDateRangeShortcut =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "last_month"
  | "year"
  | "last_year";

export interface ReportingSourceEntry {
  id: number;
  start: string;
  end: string | null;
  tags: string[];
}

export interface ReportingSourceSheet {
  name: string;
  activeEntryID: number | null;
  entries: ReportingSourceEntry[];
}

/**
 * Time tracked within a single calendar day bucket.
 */
export interface DailyTimeBucket {
  dateMs: number;
  dateLabel: string;
  weekdayIndex: number;
  totalMs: number;
}

/**
 * Time tracked grouped by tag with the share-of-total ratio.
 */
export interface TagTimeStat {
  tag: string;
  totalMs: number;
  ratio: number;
}

/**
 * Time tracked within a single weekday-of-week bucket.
 */
export interface WeekdayTimeStat {
  weekdayIndex: number;
  weekdayLabel: string;
  totalMs: number;
}

/**
 * Time tracked within an hour-of-day, weekday-of-week cell.
 */
export interface HeatmapCell {
  weekdayIndex: number;
  hourIndex: number;
  totalMs: number;
}

/**
 * Side-by-side totals for the current and previous reporting period.
 */
export interface PeriodTrendComparison {
  label: string;
  currentMs: number;
  previousMs: number;
  deltaMs: number;
  deltaRatio: number;
}

/**
 * Headline stats summarising a calendar month of tracked activity.
 */
export interface MonthInReviewStats {
  monthLabel: string;
  totalMs: number;
  trackedDays: number;
  daysInMonth: number;
  bestDayMs: number;
  bestDayLabel: string | null;
  longestEntryMs: number;
  totalEntries: number;
  topSheetName: string | null;
  topSheetMs: number;
  topTag: string | null;
  topTagMs: number;
  currentStreakDays: number;
  longestStreakDays: number;
  averageActiveDayMs: number;
}

/**
 * Hour-of-day bucket where focused work commonly lands.
 */
export interface FocusHourInsight {
  hourIndex: number;
  hourLabel: string;
  totalMs: number;
  entryCount: number;
}

/**
 * Repeated idle window detected between tracked blocks.
 */
export interface RecurringIdleWindowInsight {
  hourIndex: number;
  hourLabel: string;
  dayCount: number;
  totalIdleMs: number;
}

/**
 * Common project start time suggestion derived from sheet start history.
 */
export interface SheetStartSuggestionInsight {
  sheetName: string;
  hourIndex: number;
  hourLabel: string;
  startCount: number;
  confidence: number;
}

/**
 * Interpretive focus-pattern metrics for the active reporting range.
 */
export interface FocusPatternInsights {
  activeDayCount: number;
  bestFocusHours: FocusHourInsight[];
  interruptionCount: number;
  interruptionFrequencyPerDay: number;
  contextSwitchCount: number;
  contextSwitchesPerDay: number;
  longestDeepWorkStreakMs: number;
  longestDeepWorkStreakEntryCount: number;
  recurringIdleWindows: RecurringIdleWindowInsight[];
  sheetStartSuggestions: SheetStartSuggestionInsight[];
  deepWorkThresholdMs: number;
  interruptionGapThresholdMs: number;
  idleWindowThresholdMs: number;
}

/**
 * Bundle of analytics derived from the reporting source sheets.
 */
export interface ReportingAnalytics {
  dailyBuckets: DailyTimeBucket[];
  tagBreakdown: TagTimeStat[];
  weekdayDistribution: WeekdayTimeStat[];
  heatmap: HeatmapCell[];
  weekTrend: PeriodTrendComparison;
  monthTrend: PeriodTrendComparison;
  monthInReview: MonthInReviewStats;
  focusInsights: FocusPatternInsights;
}

/**
 * Time-tracking aggregates for a single sheet.
 */
export interface SheetReportStats {
  sheetName: string;
  totalMs: number;
  entryCount: number;
  averageEntryMs: number;
  hasActiveEntry: boolean;
}

/**
 * Time tracked within calendar periods, clipped to period boundaries.
 */
export interface ReportingPeriodTotals {
  todayMs: number;
  weekMs: number;
  monthMs: number;
}

/**
 * Cross-sheet reporting snapshot for the reporting view.
 */
export interface ReportingStats {
  activeSheets: SheetReportStats[];
  idleSheets: SheetReportStats[];
  grandTotalMs: number;
  totalEntryCount: number;
  grandAverageEntryMs: number;
  periodTotals: ReportingPeriodTotals;
}
